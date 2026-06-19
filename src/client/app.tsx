import React, { useEffect, useState, useCallback, useRef } from "react";
import { Select, SelectSelectedItemSet } from "@servicenow/react-components/Select";
import { Button } from "@servicenow/react-components/Button";
import { ButtonIconic } from "@servicenow/react-components/ButtonIconic";
import PropertiesTable from "./components/PropertiesTable";
import CreatePropertyModal, { CreatePropertyPayload } from "./components/CreatePropertyModal";
import { create } from "./services/PropertiesService";
import "./app.css";

// 
// Types
// 

interface AppItem {
  id: string;
  label: string;
}

interface SelectItem {
  id: string;
  label: string;
  group?: string;
}

// 
// Constants
// 

const RECENT_APPS_KEY = "x_589236_prprts.recent_apps";
const MAX_RECENT = 5;
const URL_PARAM = "app_sys_id";

// 
// Utility: Wait for g_ck token
// 

function waitForToken(maxWait = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const ck = (window as any).g_ck;
    if (ck) { resolve(ck); return; }

    const start = Date.now();
    const interval = setInterval(() => {
      const token = (window as any).g_ck;
      if (token) {
        clearInterval(interval);
        resolve(token);
      } else if (Date.now() - start > maxWait) {
        clearInterval(interval);
        reject(new Error("Session token unavailable. Please refresh the page."));
      }
    }, 50);
  });
}

function getHeaders(): Record<string, string> {
  const token = (window as any).g_ck;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["X-UserToken"] = token;
  return headers;
}

// 
// Data Fetching
// 
async function fetchAllApps(): Promise<AppItem[]> {
  await waitForToken();

  const allApps: AppItem[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      sysparm_fields: "sys_id,name,scope",
      sysparm_orderby: "name",
      sysparm_limit: String(batchSize),
      sysparm_offset: String(offset),
      sysparm_exclude_reference_link: "true",
      sysparm_no_count: "true"
    });

    const res = await fetch(`/api/now/table/sys_scope?${params}`, {
      headers: getHeaders(),
      credentials: "same-origin"
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const results = data.result || [];

    for (const app of results) {
      const sysId = app.sys_id || "";
      const name = app.name || "";
      if (sysId && name) {
        allApps.push({ id: sysId, label: name });
      }
    }

    hasMore = results.length === batchSize;
    offset += batchSize;
  }

  return allApps;
}

// 
// URL Parameter Helpers
// 

function getUrlParam(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(URL_PARAM) || "";
}

function setUrlParam(appSysId: string) {
  const url = new URL(window.location.href);
  if (appSysId) {
    url.searchParams.set(URL_PARAM, appSysId);
  } else {
    url.searchParams.delete(URL_PARAM);
  }
  window.history.pushState({ appSysId }, "", url.toString());
}

// 
// Recent Apps (localStorage)
// 

function getRecentAppIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_APPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecentAppId(appSysId: string) {
  if (!appSysId) return;
  const recents = getRecentAppIds().filter(id => id !== appSysId);
  recents.unshift(appSysId);
  try {
    localStorage.setItem(RECENT_APPS_KEY, JSON.stringify(recents.slice(0, MAX_RECENT)));
  } catch { /* storage full or unavailable */ }
}

// 
// Sort apps with recents at top, grouped
// 

function buildGroupedItems(apps: AppItem[], recentIds: string[]): SelectItem[] {
  if (recentIds.length === 0) return apps;

  const recentSet = new Set(recentIds);
  const recentApps: SelectItem[] = [];
  const otherApps: SelectItem[] = [];

  const appMap = new Map(apps.map(a => [a.id, a]));
  for (const id of recentIds) {
    const app = appMap.get(id);
    if (app) {
      recentApps.push({ id: app.id, label: app.label, group: "Recent" });
    }
  }

  for (const app of apps) {
    if (!recentSet.has(app.id)) {
      otherApps.push({ id: app.id, label: app.label, group: "All Applications" });
    }
  }

  return [...recentApps, ...otherApps];
}

// 
// Main App Component
// 

export default function App() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [selectedAppLabel, setSelectedAppLabel] = useState<string>("");
  const [loadError, setLoadError] = useState("");
  const [groupedItems, setGroupedItems] = useState<SelectItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; status: "positive" | "critical" } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isInitialLoad = useRef(true);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // --- Load apps and apply deep link + recents ---
  useEffect(() => {
    fetchAllApps()
      .then(items => {
        setApps(items);

        const recentIds = getRecentAppIds();
        setGroupedItems(buildGroupedItems(items, recentIds));

        const urlAppId = getUrlParam();
        if (urlAppId) {
          const match = items.find(a => a.id === urlAppId);
          if (match) {
            setSelectedAppId(match.id);
            setSelectedAppLabel(match.label);
            saveRecentAppId(match.id);
          }
        }

        isInitialLoad.current = false;
      })
      .catch(e => setLoadError(e.message || "Failed to load applications"));
  }, []);

  // --- Browser back/forward navigation ---
  useEffect(() => {
    const handlePopState = () => {
      const urlAppId = getUrlParam();
      if (urlAppId && apps.length > 0) {
        const match = apps.find(a => a.id === urlAppId);
        if (match) {
          setSelectedAppId(match.id);
          setSelectedAppLabel(match.label);
        }
      } else {
        setSelectedAppId("");
        setSelectedAppLabel("");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [apps]);

  // --- Handle user selection ---
  const handleSelect = useCallback<SelectSelectedItemSet>(event => {
    const { value: id, item } = event.detail.payload;
    const appId = id as string;
    const appLabel = (item as any).label || "";

    setSelectedAppId(appId);
    setSelectedAppLabel(appLabel);
    setUrlParam(appId);
    saveRecentAppId(appId);

    const recentIds = getRecentAppIds();
    setGroupedItems(buildGroupedItems(apps, recentIds));
  }, [apps]);

  // --- Handle create property ---
  const handleCreateSubmit = async (payload: CreatePropertyPayload) => {
    setIsCreating(true);
    try {
      await create(payload);
      setToast({ message: `Property "${payload.name}" created successfully.`, status: "positive" });
      setCreateModalOpen(false);
      // Trigger table refresh
      setRefreshKey(prev => prev + 1);
    } catch (e: any) {
      setToast({ message: e?.message || "Failed to create property", status: "critical" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="pm-page">
      <div className="pm-header">
        <h1 className="pm-header__title">Properties Manager</h1>
        <Button
          label="New Property"
          variant="primary"
          icon="plus-fill"
          size="md"
          disabled={!selectedAppId}
          tooltipContent={!selectedAppId ? "Select an application first" : ""}
          onClicked={() => setCreateModalOpen(true)}
        />
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`pm-toast pm-toast--${toast.status}`}>
          <span className="pm-toast__message">{toast.message}</span>
          <ButtonIconic
            icon="close-outline"
            bare={true}
            size="sm"
            hidePadding={true}
            configAria={{ "aria-label": "Dismiss" }}
            onClicked={() => setToast(null)}
          />
        </div>
      )}

      <div className="pm-card">
        <label className="pm-card__label">Select Application</label>
        <div className="pm-card__input">
          <Select
            items={groupedItems}
            selectedItem={selectedAppId}
            search="contains"
            onSelectedItemSet={handleSelect}
          />
        </div>
        {loadError && (
          <p className="pm-card__error">Failed to load applications: {loadError}</p>
        )}
      </div>
      {selectedAppId && (
        <PropertiesTable
          key={refreshKey}
          scopeId={selectedAppId}
          scopeLabel={selectedAppLabel}
        />
      )}
      {!selectedAppId && (
        <p className="pm-page__empty">
          Select an application above to view and manage its properties.
        </p>
      )}

      {/* Create Property Modal */}
      <CreatePropertyModal
        opened={createModalOpen}
        scopeId={selectedAppId}
        scopeLabel={selectedAppLabel}
        isCreating={isCreating}
        onSubmit={handleCreateSubmit}
        onCancel={() => setCreateModalOpen(false)}
      />
    </div>
  );
}

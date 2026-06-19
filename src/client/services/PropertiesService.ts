/**
 * PropertiesService.ts
 * 
 * Client-side service for CRUD operations on sys_properties.
 *
 * Architecture:
 * - READ: Uses the standard Table API (sys_properties has read_access=1)
 * - WRITE (UPDATE/DELETE): Routes through our scoped Scripted REST API
 *   proxy at /api/x_589236_prprts/properties_manager which delegates
 *   to the global PropertiesHelperGlobal Script Include to bypass
 *   cross-scope restrictions (update_access=0 on sys_properties).
 * 
 */

export interface PropertyRecord {
  sys_id: string;
  name: string;
  value: string;
  type: string;
  description: string;
}

// --- Constants ---
const TABLE_API = "/api/now/table/sys_properties";
const PROXY_API = "/api/x_589236_prprts/properties_manager";

// --- Helpers ---
function getHeaders(): Record<string, string> {
  const token = (window as any).g_ck;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  if (token) {
    headers["X-UserToken"] = token;
  }
  return headers;
}

function extractField(field: any): string {
  if (field == null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field.display_value || field.value || "";
  return String(field);
}

// 
// READ – Standard Table API (read_access=1, no restrictions)
// 

export async function list(scopeId: string): Promise<PropertyRecord[]> {
  const allRecords: PropertyRecord[] = [];
  let offset = 0;
  const batchSize = 200;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      sysparm_query: `sys_scope=${scopeId}`,
      sysparm_fields: "sys_id,name,value,type,description",
      sysparm_limit: String(batchSize),
      sysparm_offset: String(offset),
      sysparm_exclude_reference_link: "true",
      sysparm_no_count: "true",
      sysparm_suppress_pagination_header: "true"
    });

    const res = await fetch(`${TABLE_API}?${params}`, { headers: getHeaders(), credentials: "same-origin" });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch properties`);
    }

    const data = await res.json();
    const results = data.result || [];

    for (const r of results) {
      allRecords.push({
        sys_id: extractField(r.sys_id),
        name: extractField(r.name),
        value: extractField(r.value),
        type: extractField(r.type),
        description: extractField(r.description)
      });
    }

    hasMore = results.length === batchSize;
    offset += batchSize;
  }

  return allRecords;
}

// 
// UPDATE – Routes through scoped Scripted REST API proxy
// 

export async function update(
  sysId: string,
  payload: { name?: string; value?: string; type?: string; description?: string }
): Promise<void> {
  const res = await fetch(`${PROXY_API}/update`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "same-origin",
    body: JSON.stringify({
      sys_id: sysId,
      ...payload
    })
  });

  if (res.ok) return;

  // Parse error details from the proxy response
  let errorMessage = `HTTP ${res.status}: Failed to update property`;
  try {
    const errorData = await res.json();
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    } else if (errorData?.result?.error) {
      errorMessage = errorData.result.error;
    }
  } catch { /* use default message */ }

  throw new Error(errorMessage);
}

// 
// CREATE – Routes through scoped Scripted REST API proxy
// 

export async function create(payload: {
  name: string;
  value: string;
  type: string;
  description: string;
  sys_scope: string;
}): Promise<string> {
  const res = await fetch(`${PROXY_API}/create`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    const data = await res.json();
    return data?.result?.sys_id || "";
  }

  let errorMessage = `HTTP ${res.status}: Failed to create property`;
  try {
    const errorData = await res.json();
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    } else if (errorData?.result?.error) {
      errorMessage = errorData.result.error;
    }
  } catch { /* use default message */ }

  throw new Error(errorMessage);
}

// 
// DELETE – Routes through scoped Scripted REST API proxy
// 

export async function remove(sysId: string): Promise<void> {
  const res = await fetch(`${PROXY_API}/delete/${sysId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "same-origin"
  });

  if (res.ok) return;

  let errorMessage = `HTTP ${res.status}: Failed to delete property`;
  try {
    const errorData = await res.json();
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    } else if (errorData?.result?.error) {
      errorMessage = errorData.result.error;
    }
  } catch { /* use default message */ }

  throw new Error(errorMessage);
}

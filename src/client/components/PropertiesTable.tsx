import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Alert } from "@servicenow/react-components/Alert";
import { Input } from "@servicenow/react-components/Input";
import { ButtonIconic } from "@servicenow/react-components/ButtonIconic";
import { list, update, remove, PropertyRecord } from "../services/PropertiesService";
import PropertyRow from "./PropertyRow";
import DeleteModal from "./DeleteModal";
import "./PropertiesTable.css";

interface PropertiesTableProps {
  scopeId: string;
  scopeLabel: string;
}

type SortDirection = "asc" | "desc";

export default function PropertiesTable({ scopeId, scopeLabel }: PropertiesTableProps) {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PropertyRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; status: "positive" | "critical" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await list(scopeId);
      setProperties(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [scopeId]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleSave = async (sysId: string, data: Partial<PropertyRecord>) => {
    setSavingRowId(sysId);
    try {
      await update(sysId, data);
      setToast({ message: "Property updated successfully.", status: "positive" });
      await fetchProperties();
    } catch (e: any) {
      setToast({ message: e?.message || "Failed to save property", status: "critical" });
    } finally {
      setSavingRowId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingRowId(deleteTarget.sys_id);
    try {
      await remove(deleteTarget.sys_id);
      setToast({ message: `Property "${deleteTarget.name}" deleted successfully.`, status: "positive" });
      setDeleteTarget(null);
      await fetchProperties();
    } catch (e: any) {
      setToast({ message: e?.message || "Failed to delete property", status: "critical" });
      setDeleteTarget(null);
    } finally {
      setDeletingRowId(null);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = properties;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
    }

    result = [...result].sort((a, b) => {
      const aVal = (a[sortColumn as keyof PropertyRecord] || "").toLowerCase();
      const bVal = (b[sortColumn as keyof PropertyRecord] || "").toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [properties, searchTerm, sortColumn, sortDirection]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "value", label: "Value" },
    { key: "type", label: "Type" },
    { key: "description", label: "Description" }
  ];

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;
    return (
      <ButtonIconic
        icon={sortDirection === "asc" ? "chevron-up-fill" : "chevron-down-fill"}
        bare={true}
        size="sm"
        hidePadding={true}
        configAria={{ "aria-label": `Sorted ${sortDirection === "asc" ? "ascending" : "descending"}` }}
      />
    );
  };

  return (
    <div>
      <h2 className="properties-table__header">Properties for {scopeLabel}</h2>
      {toast && (
        <div className={`properties-table__toast properties-table__toast--${toast.status}`}>
          <span className="properties-table__toast-message">{toast.message}</span>
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
      {error && (
        <div className="properties-table__alert">
          <Alert
            status="critical"
            header="Error"
            content={error}
            action={{ type: "dismiss" }}
            onActionClicked={() => setError("")}
          />
        </div>
      )}
      {loading ? (
        <p className="properties-table__loading">Loading properties…</p>
      ) : properties.length === 0 ? (
        <p className="properties-table__empty">No properties found for this application.</p>
      ) : (
        <>
          <div className="properties-table__filter-card">
            <label className="properties-table__filter-label">Search Properties</label>
            <div className="properties-table__filter-input">
              <Input
                placeholder="Filter by name or description..."
                value={searchTerm}
                onInput={(e: any) => {
                  setSearchTerm(e.detail.payload.fieldValue);
                }}
              />
            </div>
            <span className="properties-table__filter-count">
              {filteredAndSorted.length} {filteredAndSorted.length === 1 ? "result" : "results"}
            </span>
          </div>
          <table className="properties-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)}>
                    <span className="properties-table__th-content">
                      {col.label}
                      {renderSortIcon(col.key)}
                    </span>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map(prop => (
                <PropertyRow
                  key={prop.sys_id}
                  property={prop}
                  onSave={handleSave}
                  onDelete={setDeleteTarget}
                  isSaving={savingRowId === prop.sys_id}
                />
              ))}
            </tbody>
          </table>
        </>
      )}
      <DeleteModal
        opened={!!deleteTarget}
        propertyName={deleteTarget?.name || ""}
        isDeleting={!!deletingRowId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

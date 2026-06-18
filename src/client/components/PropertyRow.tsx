import React, { useState, useEffect, useRef } from "react";
import { ButtonIconic } from "@servicenow/react-components/ButtonIconic";
import { Input } from "@servicenow/react-components/Input";
import { Dropdown } from "@servicenow/react-components/Dropdown";
import { Toggle } from "@servicenow/react-components/Toggle";
import { PropertyRecord } from "../services/PropertiesService";
import "./PropertyRow.css";

interface PropertyRowProps {
  property: PropertyRecord;
  onSave: (sysId: string, data: Partial<PropertyRecord>) => void;
  onDelete: (property: PropertyRecord) => void;
  isSaving: boolean;
}

const TYPE_OPTIONS = [
  { id: "string", label: "String" },
  { id: "integer", label: "Integer" },
  { id: "boolean", label: "Boolean" },
  { id: "choicelist", label: "Choice" }
];

export default function PropertyRow({ property, onSave, onDelete, isSaving }: PropertyRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: property.name,
    value: property.value,
    type: property.type,
    description: property.description
  });

  const wasSaving = useRef(false);

  useEffect(() => {
    if (wasSaving.current && !isSaving) {
      setIsEditing(false);
    }
    wasSaving.current = isSaving;
  }, [isSaving]);

  const handleEdit = () => {
    setEditValues({
      name: property.name,
      value: property.value,
      type: property.type,
      description: property.description
    });
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    onSave(property.sys_id, editValues);
  };

  const handleFieldChange = (field: string) => (e: any) => {
    const newVal = e.detail.payload.value;
    setEditValues(prev => ({ ...prev, [field]: newVal }));
  };

  const handleTypeChange = (e: any) => {
    const val = e.detail.payload.value;
    const newType = val[0] || editValues.type;
    setEditValues(prev => {
      let newValue = prev.value;
      if (newType === "boolean" && prev.type !== "boolean") {
        newValue = "false";
      } else if (newType !== "boolean" && prev.type === "boolean") {
        newValue = "";
      }
      return { ...prev, type: newType, value: newValue };
    });
  };

  const renderValueInput = () => {
    switch (editValues.type) {
      case "boolean":
        return (
          <div className="property-row__toggle-cell">
            <Toggle
              checked={editValues.value === "true"}
              size="sm"
              disabled={isSaving}
              onCheckedSet={(e: any) =>
                setEditValues(prev => ({ ...prev, value: String(e.detail.payload.value) }))
              }
            />
          </div>
        );
      case "integer":
        return (
          <Input
            type="number"
            value={editValues.value}
            size="sm"
            disabled={isSaving}
            onValueSet={handleFieldChange("value")}
          />
        );
      default:
        return (
          <Input
            value={editValues.value}
            size="sm"
            disabled={isSaving}
            onValueSet={handleFieldChange("value")}
          />
        );
    }
  };

  if (isEditing) {
    return (
      <tr className="property-row property-row--editing">
        <td data-label="Name">
          <Input value={editValues.name} size="sm" disabled={isSaving} onValueSet={handleFieldChange("name")} />
        </td>
        <td data-label="Value">{renderValueInput()}</td>
        <td data-label="Type">
          <Dropdown
            items={TYPE_OPTIONS}
            selectedItems={[editValues.type]}
            select="single"
            size="sm"
            variant="secondary"
            disabled={isSaving}
            onSelectedItemsSet={handleTypeChange}
          />
        </td>
        <td data-label="Description">
          <Input value={editValues.description} size="sm" disabled={isSaving} onValueSet={handleFieldChange("description")} />
        </td>
        <td data-label="Actions">
          {isSaving ? (
            <div className="property-row__spinner-container">
              <div className="property-row__spinner" />
              <span className="property-row__spinner-text">Saving…</span>
            </div>
          ) : (
            <div className="property-row__actions">
              <ButtonIconic
                icon="check-outline"
                variant="primary"
                tooltipContent="Save"
                configAria={{ "aria-label": "Save" }}
                onClicked={handleSave}
              />
              <ButtonIconic
                icon="close-outline"
                variant="secondary"
                bare={true}
                tooltipContent="Cancel"
                configAria={{ "aria-label": "Cancel" }}
                onClicked={handleCancel}
              />
            </div>
          )}
        </td>
      </tr>
    );
  }

  return (
    <tr className="property-row">
      <td data-label="Name">{property.name}</td>
      <td data-label="Value">{property.value}</td>
      <td data-label="Type">{property.type}</td>
      <td data-label="Description">{property.description}</td>
      <td data-label="Actions">
        <div className="property-row__actions">
          <ButtonIconic
            icon="pencil-outline"
            variant="secondary"
            bare={true}
            tooltipContent="Edit"
            configAria={{ "aria-label": "Edit" }}
            onClicked={handleEdit}
          />
          <ButtonIconic
            icon="trash-outline"
            variant="secondary"
            bare={true}
            tooltipContent="Delete"
            configAria={{ "aria-label": "Delete" }}
            onClicked={() => onDelete(property)}
          />
        </div>
      </td>
    </tr>
  );
}

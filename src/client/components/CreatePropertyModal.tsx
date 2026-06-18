import React, { useState, useCallback } from "react";
import { Modal } from "@servicenow/react-components/Modal";
import { Input } from "@servicenow/react-components/Input";
import { Dropdown } from "@servicenow/react-components/Dropdown";
import { Toggle } from "@servicenow/react-components/Toggle";
import { Textarea } from "@servicenow/react-components/Textarea";
import "./CreatePropertyModal.css";

interface CreatePropertyModalProps {
  opened: boolean;
  scopeId: string;
  scopeLabel: string;
  isCreating: boolean;
  onSubmit: (payload: CreatePropertyPayload) => void;
  onCancel: () => void;
}

export interface CreatePropertyPayload {
  name: string;
  value: string;
  type: string;
  description: string;
  sys_scope: string;
}

const TYPE_OPTIONS = [
  { id: "string", label: "String" },
  { id: "integer", label: "Integer" },
  { id: "boolean", label: "Boolean" },
  { id: "choicelist", label: "Choice" }
];

export default function CreatePropertyModal({
  opened,
  scopeId,
  scopeLabel,
  isCreating,
  onSubmit,
  onCancel
}: CreatePropertyModalProps) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("string");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setValue("");
    setType("string");
    setDescription("");
    setValidationError("");
  }, []);

  const handleCancel = () => {
    if (isCreating) return;
    resetForm();
    onCancel();
  };

  const handleSubmit = () => {
    if (isCreating) return;

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError("Property name is required.");
      return;
    }
    if (/\s/.test(trimmedName)) {
      setValidationError("Property name cannot contain spaces. Use dots or underscores.");
      return;
    }

    setValidationError("");
    onSubmit({
      name: trimmedName,
      value: value,
      type: type,
      description: description.trim(),
      sys_scope: scopeId
    });
  };

  const handleTypeChange = (e: any) => {
    const val = e.detail.payload.value;
    const newType = val[0] || type;
    setType(newType);

    // Reset value when switching to/from boolean
    if (newType === "boolean") {
      setValue("false");
    } else if (type === "boolean") {
      setValue("");
    }
  };

  const renderValueField = () => {
    switch (type) {
      case "boolean":
        return (
          <div className="create-modal__toggle-row">
            <Toggle
              checked={value === "true"}
              size="md"
              disabled={isCreating}
              onCheckedSet={(e: any) => setValue(String(e.detail.payload.value))}
            />
            <span className="create-modal__toggle-label">
              {value === "true" ? "true" : "false"}
            </span>
          </div>
        );
      case "integer":
        return (
          <Input
            type="number"
            value={value}
            placeholder="0"
            disabled={isCreating}
            onValueSet={(e: any) => setValue(e.detail.payload.value)}
          />
        );
      default:
        return (
          <Input
            value={value}
            placeholder="Enter property value..."
            disabled={isCreating}
            onValueSet={(e: any) => setValue(e.detail.payload.value)}
          />
        );
    }
  };

  return (
    <Modal
      opened={opened}
      size="md"
      headerLabel="Create New Property"
      footerActions={[
        { label: "Cancel", variant: "secondary" },
        { label: isCreating ? "Creating…" : "Create Property", variant: "primary" }
      ]}
      onOpenedSet={(e: any) => {
        if (isCreating) return;
        if (!e.detail.payload.value) handleCancel();
      }}
      onFooterActionClicked={(e: any) => {
        const label = e.detail.payload.action.label;
        if (label === "Cancel") handleCancel();
        else if (label === "Create Property") handleSubmit();
      }}
    >
      <div className="create-modal__form">
        <div className="create-modal__scope-badge">
          Creating in: <strong>{scopeLabel}</strong>
        </div>

        {validationError && (
          <div className="create-modal__error">{validationError}</div>
        )}

        <div className="create-modal__field">
          <label className="create-modal__label">Name <span className="create-modal__required">*</span></label>
          <Input
            value={name}
            placeholder="e.g. my.app.feature_enabled"
            disabled={isCreating}
            onValueSet={(e: any) => setName(e.detail.payload.value)}
          />
        </div>

        <div className="create-modal__field">
          <label className="create-modal__label">Type</label>
          <Dropdown
            items={TYPE_OPTIONS}
            selectedItems={[type]}
            select="single"
            variant="secondary"
            disabled={isCreating}
            onSelectedItemsSet={handleTypeChange}
          />
        </div>

        <div className="create-modal__field">
          <label className="create-modal__label">Value</label>
          {renderValueField()}
        </div>

        <div className="create-modal__field">
          <label className="create-modal__label">Description</label>
          <Textarea
            value={description}
            placeholder="Describe what this property controls..."
            disabled={isCreating}
            maxlength={1000}
            resize="vertical"
            onValueSet={(e: any) => setValue(e.detail.payload.value)}
            onInput={(e: any) => setDescription(e.detail.payload.fieldValue || e.detail.payload.value || "")}
          />
        </div>
      </div>
    </Modal>
  );
}

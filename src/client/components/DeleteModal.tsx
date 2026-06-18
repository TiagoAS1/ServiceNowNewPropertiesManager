import React from "react";
import { Modal } from "@servicenow/react-components/Modal";

interface DeleteModalProps {
  opened: boolean;
  propertyName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ opened, propertyName, isDeleting, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <Modal
      opened={opened}
      size="sm"
      headerLabel="Confirm Deletion"
      content={
        isDeleting
          ? `Deleting "${propertyName}"... Please wait.`
          : `Are you sure you want to delete the property "${propertyName}"?`
      }
      footerActions={[
        { label: "Cancel", variant: "secondary" },
        { label: isDeleting ? "Deleting…" : "Confirm Deletion", variant: "primary" }
      ]}
      onOpenedSet={(e: any) => {
        if (isDeleting) return;
        if (!e.detail.payload.value) onCancel();
      }}
      onFooterActionClicked={(e: any) => {
        if (isDeleting) return;
        if (e.detail.payload.action.label === "Confirm Deletion") onConfirm();
        else onCancel();
      }}
    />
  );
}

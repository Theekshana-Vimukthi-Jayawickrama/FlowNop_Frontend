import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">{message}</p>
        <div className="flex items-center justify-end gap-3 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isConfirming}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

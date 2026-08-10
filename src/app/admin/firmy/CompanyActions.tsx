"use client";

import { useFormStatus } from "react-dom";

type CompanyActionsProps = {
  companyId: number;
  companyName: string;
  isActive: boolean | null;
  approveAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  classNames: {
    actionButtons: string;
    approveBtn: string;
    editBtn: string;
    deleteBtn: string;
  };
};

function SubmitButton({
  className,
  idleLabel,
  pendingLabel,
}: {
  className: string;
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export default function CompanyActions({
  companyId,
  companyName,
  isActive,
  approveAction,
  deleteAction,
  classNames,
}: CompanyActionsProps) {
  return (
    <div className={classNames.actionButtons}>
      {!isActive && (
        <form action={approveAction}>
          <input type="hidden" name="id" value={companyId} />
          <SubmitButton
            className={classNames.approveBtn}
            idleLabel="Akceptuj"
            pendingLabel="Akceptowanie…"
          />
        </form>
      )}

      <a href={`/admin/firmy/${companyId}`} className={classNames.editBtn}>
        Edytuj
      </a>

      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm(`Czy na pewno usunąć firmę „${companyName}”? Tej operacji nie można cofnąć.`)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={companyId} />
        <SubmitButton
          className={classNames.deleteBtn}
          idleLabel="Usuń"
          pendingLabel="Usuwanie…"
        />
      </form>
    </div>
  );
}

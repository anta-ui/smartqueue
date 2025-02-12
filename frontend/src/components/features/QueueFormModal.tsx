"use client";

import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { Queue, QueueType } from "@/types/queue";

interface QueueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Queue>) => Promise<void>;
  queue?: Queue;
  queueTypes: QueueType[];
}

export function QueueFormModal({
  isOpen,
  onClose,
  onSubmit,
  queue,
  queueTypes,
}: QueueFormModalProps) {
  const [formData, setFormData] = useState<Partial<Queue>>(
    queue || {
      name: "",
      queueTypeId: "",
      isPriority: false,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError("Failed to save queue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={queue ? "Edit Queue" : "Create New Queue"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Queue Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Queue Type
          </label>
          <select
            value={formData.queueTypeId}
            onChange={(e) =>
              setFormData({ ...formData, queueTypeId: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a queue type</option>
            {queueTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPriority"
            checked={formData.isPriority}
            onChange={(e) =>
              setFormData({ ...formData, isPriority: e.target.checked })
            }
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isPriority"
            className="ml-2 block text-sm text-gray-900"
          >
            Priority Queue
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <Button
            type="submit"
            isLoading={loading}
            className="w-full sm:col-start-2"
          >
            {queue ? "Save Changes" : "Create Queue"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="mt-3 w-full sm:col-start-1 sm:mt-0"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

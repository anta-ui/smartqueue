"use client";

import { useEffect, useState } from "react";
import { queueService } from "@/services/queues";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { QueueDetailView } from "@/components/queues/QueueDetailView";
import type { Queue, Ticket } from "@/types/queue";
import React from "react";

export default function QueuesPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);

  useEffect(() => {
    loadQueues();
  }, []);

  const loadQueues = async () => {
    try {
      const data = await queueService.getQueues();
      setQueues(data);
    } catch (err) {
      setError("Failed to load queues");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (queueId: string, status: Queue["status"]) => {
    try {
      await queueService.updateQueueStatus(queueId, status);
      loadQueues();
    } catch (err) {
      setError("Failed to update queue status");
    }
  };

  // Handle creating a new queue
  const handleCreateQueue = () => {
    // Logic for creating a new queue should go here
    console.log("Create new queue");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Queue Management</h1>
        <Button onClick={handleCreateQueue}>Create New Queue</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queues.map((queue) => (
          <Card key={queue.id} onClick={() => setSelectedQueue(queue)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{queue.name}</h3>
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    queue.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : queue.status === "PAUSED"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {queue.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Current Number</span>
                  <span className="text-xl font-semibold">{queue.currentNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Wait Time</span>
                  <span>{queue.currentWaitTime} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Priority</span>
                  <span>{queue.isPriority ? "Yes" : "No"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatusChange(queue.id, "PAUSED")}
                    disabled={queue.status === "PAUSED"}
                  >
                    Pause
                  </Button>
                  <Button
                    variant={queue.status === "ACTIVE" ? "danger" : "primary"}
                    size="sm"
                    onClick={() =>
                      handleStatusChange(
                        queue.id,
                        queue.status === "ACTIVE" ? "CLOSED" : "ACTIVE"
                      )
                    }
                  >
                    {queue.status === "ACTIVE" ? "Close" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de détail de la file */}
      {selectedQueue && (
        <Modal
          isOpen={!!selectedQueue}
          onClose={() => setSelectedQueue(null)}
          className="max-w-4xl"
        >
          <QueueDetailView
            queue={selectedQueue}
            onStatusChange={(status) => handleStatusChange(selectedQueue.id, status)}
          />
        </Modal>
      )}
    </div>
  );
}

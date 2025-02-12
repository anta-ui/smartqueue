"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaitTimePredictorView } from "@/components/features/ai/WaitTimePredictor";
import { ResourceOptimizer } from "@/components/features/ai/ResourceOptimizer";
import { AIChat } from "@/components/features/ai/AIChat";
import { AnomalyDetector } from "@/components/features/ai/AnomalyDetector";
import {
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState("predictions");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Intelligence Artificielle</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="predictions">
            <ClockIcon className="h-5 w-5 mr-2" />
            Prédictions
          </TabsTrigger>
          <TabsTrigger value="resources">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Ressources
          </TabsTrigger>
          <TabsTrigger value="chat">
            <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
            Assistant IA
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Anomalies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exemple avec deux files d'attente */}
            <WaitTimePredictorView queueId="queue1" />
            <WaitTimePredictorView queueId="queue2" />
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <ResourceOptimizer
            servicePointIds={["sp1", "sp2", "sp3"]}
            onSuggestionApply={async (suggestion) => {
              // Implémenter l'application des suggestions
              console.log("Applying suggestion:", suggestion);
            }}
          />
        </TabsContent>

        <TabsContent value="chat">
          <div className="max-w-2xl mx-auto">
            <AIChat
              userId="admin1"
              onEscalate={(session) => {
                console.log("Chat escalated:", session);
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="anomalies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exemple avec deux files d'attente */}
            <AnomalyDetector
              queueId="queue1"
              onAnomalyDetected={(anomaly) => {
                console.log("New anomaly detected:", anomaly);
              }}
              onAnomalyResolved={(anomalyId) => {
                console.log("Anomaly resolved:", anomalyId);
              }}
            />
            <AnomalyDetector
              queueId="queue2"
              onAnomalyDetected={(anomaly) => {
                console.log("New anomaly detected:", anomaly);
              }}
              onAnomalyResolved={(anomalyId) => {
                console.log("Anomaly resolved:", anomalyId);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

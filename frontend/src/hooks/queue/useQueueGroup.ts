"use client";

import { useState, useEffect } from "react";
import { useQueueWebSocket } from "./useQueueWebSocket";

interface GroupMember {
  id: string;
  name: string;
  position: number;
  joinedAt: number;
  isLeader: boolean;
}

interface UseQueueGroupReturn {
  groupId: string | null;
  members: GroupMember[];
  isLeader: boolean;
  createGroup: () => Promise<string>;
  joinGroup: (groupId: string, name: string) => Promise<void>;
  leaveGroup: () => Promise<void>;
  updatePosition: (position: number) => Promise<void>;
  transferLeadership: (memberId: string) => Promise<void>;
}

export function useQueueGroup(queueId: string): UseQueueGroupReturn {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLeader, setIsLeader] = useState(false);

  const { socket } = useQueueWebSocket({
    queueId,
    onMessage: (message) => {
      if (message.type === "group_update") {
        setMembers(message.members);
      } else if (message.type === "leader_update") {
        setIsLeader(message.isLeader);
      }
    },
  });

  const createGroup = async () => {
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queueId,
        }),
      });

      const { groupId } = await response.json();
      setGroupId(groupId);
      setIsLeader(true);
      return groupId;
    } catch (error) {
      console.error("Failed to create group:", error);
      throw error;
    }
  };

  const joinGroup = async (groupId: string, name: string) => {
    try {
      await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      setGroupId(groupId);
    } catch (error) {
      console.error("Failed to join group:", error);
      throw error;
    }
  };

  const leaveGroup = async () => {
    if (!groupId) return;

    try {
      await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
      });

      setGroupId(null);
      setMembers([]);
      setIsLeader(false);
    } catch (error) {
      console.error("Failed to leave group:", error);
      throw error;
    }
  };

  const updatePosition = async (position: number) => {
    if (!groupId) return;

    try {
      await fetch(`/api/groups/${groupId}/position`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position,
        }),
      });
    } catch (error) {
      console.error("Failed to update position:", error);
      throw error;
    }
  };

  const transferLeadership = async (memberId: string) => {
    if (!groupId || !isLeader) return;

    try {
      await fetch(`/api/groups/${groupId}/leader`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
        }),
      });

      setIsLeader(false);
    } catch (error) {
      console.error("Failed to transfer leadership:", error);
      throw error;
    }
  };

  useEffect(() => {
    return () => {
      if (groupId) {
        leaveGroup();
      }
    };
  }, []);

  return {
    groupId,
    members,
    isLeader,
    createGroup,
    joinGroup,
    leaveGroup,
    updatePosition,
    transferLeadership,
  };
}

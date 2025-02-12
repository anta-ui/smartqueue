"use client";

import { useState } from "react";
import { useQueueGroup } from "@/hooks/queue/useQueueGroup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserGroupIcon,
  UserIcon,
  ClipboardIcon,
  ArrowPathIcon,
  CrownIcon,
} from "@heroicons/react/24/outline";
import { CrownIcon as CrownIconSolid } from "@heroicons/react/24/solid";

interface QueueGroupProps {
  queueId: string;
}

export function QueueGroup({ queueId }: QueueGroupProps) {
  const {
    groupId,
    members,
    isLeader,
    createGroup,
    joinGroup,
    leaveGroup,
    transferLeadership,
  } = useQueueGroup(queueId);

  const [showDialog, setShowDialog] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateGroup = async () => {
    const newGroupId = await createGroup();
    setGroupCode(newGroupId);
    setShowDialog(false);
  };

  const handleJoinGroup = async () => {
    await joinGroup(groupCode, name);
    setShowDialog(false);
    setGroupCode("");
    setName("");
  };

  const copyGroupId = async () => {
    if (!groupId) return;
    await navigator.clipboard.writeText(groupId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!groupId) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Rejoindre un groupe
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejoindre un groupe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCreateGroup}
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Créer un nouveau groupe
              </Button>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Code du groupe"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
              />
              <Button
                className="w-full"
                disabled={!name || !groupCode}
                onClick={handleJoinGroup}
              >
                Rejoindre
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Votre groupe</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyGroupId}
            className="text-gray-600"
          >
            <ClipboardIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => leaveGroup()}
            className="text-red-600"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">
                  Position : {member.position}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {member.isLeader ? (
                <CrownIconSolid className="h-5 w-5 text-yellow-500" />
              ) : (
                isLeader && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => transferLeadership(member.id)}
                    className="text-gray-600"
                  >
                    <CrownIcon className="h-5 w-5" />
                  </Button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

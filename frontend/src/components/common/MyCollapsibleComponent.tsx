'use client';

import React from 'react';
import { 
    Collapsible, 
    CollapsibleTrigger, 
    CollapsibleContent 
  } from '@/components/ui/collapsible'

export function MyCollapsibleComponent() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Click to toggle</CollapsibleTrigger>
      <CollapsibleContent>
        Content that will be shown/hidden
      </CollapsibleContent>
    </Collapsible>
  )
}
// src/components/ui/Icons.tsx
import { 
    LucideProps, 
    Plus, 
    Edit, 
    Trash2, 
    Filter, 
    Search, 
    MoreHorizontal 
  } from 'lucide-react'
  
  export const Icons = {
    Plus: (props: LucideProps) => <Plus {...props} />,
    Edit: (props: LucideProps) => <Edit {...props} />,
    Delete: (props: LucideProps) => <Trash2 {...props} />,
    Filter: (props: LucideProps) => <Filter {...props} />,
    Search: (props: LucideProps) => <Search {...props} />,
    MoreHorizontal: (props: LucideProps) => <MoreHorizontal {...props} />
  }
  
  // Type pour faciliter l'utilisation
  export type Icon = (props: LucideProps) => JSX.Element
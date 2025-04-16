import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Folder, FilePlus, Edit, Trash, Plus, FileText } from 'lucide-react';
import { useCharacter } from '@/context/character-context';

export function Sidebar() {
  const [location] = useLocation();
  const { folders, characters } = useCharacter();

  return (
    <aside className="w-full md:w-64 bg-secondary border-r border-border flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <h1 className="cinzel text-primary text-xl font-bold">5D Character Creator</h1>
      </div>
      
      <div className="p-4 border-b border-border flex-1 overflow-y-auto">
        <h2 className="uppercase tracking-wider text-xs font-bold mb-4 text-muted-foreground">CHARACTERS</h2>
        <nav>
          <ul className="space-y-1">
            {folders.map((folder) => (
              <li key={folder.name}>
                <div className="flex items-center py-1 px-2 rounded hover:bg-primary/20 cursor-pointer group">
                  <Folder className="w-4 h-4 text-primary mr-2" />
                  <span>{folder.name}</span>
                </div>
                <ul className="ml-7 mt-1 space-y-1">
                  {folder.categories.map((category) => (
                    <li key={category.name} className="flex items-center py-1 px-2 rounded hover:bg-primary/20 cursor-pointer">
                      <FileText className="w-4 h-4 text-accent mr-2" />
                      <span>{category.name}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="p-4 mt-auto border-t border-border">
        <div className="flex items-center space-x-3">
          <Link href="/character/new">
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary/90">
              <Plus className="w-4 h-4" />
            </button>
          </Link>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary/90">
            <Edit className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary/90">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="uppercase tracking-wider text-xs font-bold mb-2 text-muted-foreground">MENU</div>
      </div>
    </aside>
  );
}

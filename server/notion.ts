import { Client } from '@notionhq/client';
import { Character } from '@shared/schema';
import { log } from './vite';

// Initialize Notion client
const notionApiKey = process.env.NOTION_API_KEY;
if (!notionApiKey) {
  console.warn('NOTION_API_KEY not found. Notion integration disabled.');
}

const notion = notionApiKey ? new Client({ auth: notionApiKey }) : null;

// Check if Notion integration is available
export const isNotionAvailable = (): boolean => {
  return notion !== null;
};

// Get database ID from Notion URL
export const extractDatabaseId = (url: string): string | null => {
  try {
    // Extract the ID from Notion URL formats
    // Example: https://www.notion.so/workspace/abc123def456?v=...
    // or: https://www.notion.so/abc123def456?v=...
    const matches = url.match(/([a-zA-Z0-9]+)(\?|$)/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch (error) {
    log(`Error extracting database ID: ${error}`, 'notion');
    return null;
  }
};

// Create a new character page in Notion
export async function exportCharacterToNotion(character: Character, databaseId: string): Promise<string | null> {
  try {
    if (!notion) {
      throw new Error('Notion client not initialized');
    }

    // Validate the database ID exists
    try {
      await notion.databases.retrieve({ database_id: databaseId });
    } catch (error) {
      log(`Invalid database ID: ${databaseId}`, 'notion');
      throw new Error('Invalid Notion database ID');
    }

    // Create traits as bulleted list
    let traitsContent: any[] = [];
    if (character.traits && typeof character.traits === 'string') {
      try {
        const traitsArray = JSON.parse(character.traits);
        traitsContent = traitsArray.map((trait: any) => ({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${trait.name}: ${trait.value}/100 - ${trait.description || ''}`,
                }
              }
            ]
          }
        }));
      } catch (e) {
        log(`Error parsing traits: ${e}`, 'notion');
      }
    }

    // Create relationships as bulleted list
    let relationshipsContent: any[] = [];
    if (character.relationships && typeof character.relationships === 'string') {
      try {
        const relationshipsArray = JSON.parse(character.relationships);
        relationshipsContent = relationshipsArray.map((rel: any) => ({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${rel.name} (${rel.relation}) - ${rel.description || ''}${rel.strength ? ` - Bond strength: ${rel.strength}/100` : ''}`,
                }
              }
            ]
          }
        }));
      } catch (e) {
        log(`Error parsing relationships: ${e}`, 'notion');
      }
    }

    // Create the page in Notion
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      icon: character.imageUrl ? {
        type: 'external',
        external: {
          url: character.imageUrl,
        },
      } : undefined,
      cover: character.imageUrl ? {
        type: 'external',
        external: {
          url: character.imageUrl,
        },
      } : undefined,
      properties: {
        // This assumes your database has these property names
        // Modify according to your actual Notion database schema
        'Name': {
          title: [
            {
              text: {
                content: character.name,
              },
            },
          ],
        },
        'Role': {
          rich_text: [
            {
              text: {
                content: character.role,
              },
            },
          ],
        },
        'Category': {
          select: {
            name: character.category,
          },
        },
        'Progress': {
          number: character.progress || 0,
        },
      },
      children: [
        // Description
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Description' } }],
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: character.description || '',
                }
              }
            ]
          }
        },
        // Appearance
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Appearance' } }],
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: character.appearance || '',
                }
              }
            ]
          }
        },
        // Traits
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Traits' } }],
          }
        },
        ...traitsContent,
        // Motivations
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Motivations' } }],
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: character.motivations || '',
                }
              }
            ]
          }
        },
        // Conflicts
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Conflicts' } }],
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: character.conflicts || '',
                }
              }
            ]
          }
        },
        // Backstory
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Backstory' } }],
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: character.backstory || '',
                }
              }
            ]
          }
        },
        // Relationships
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Relationships' } }],
          }
        },
        ...relationshipsContent,
        // Character Arc
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Character Arc' } }],
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: character.arc || '',
                }
              }
            ]
          }
        },
        // Voice
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Voice' } }],
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: character.voice || '',
                }
              }
            ]
          }
        },
      ],
    });

    log(`Character exported to Notion: ${response.url}`, 'notion');
    return response.url;
  } catch (error) {
    log(`Error exporting character to Notion: ${error}`, 'notion');
    throw error;
  }
}

// Get a list of available Notion databases
export async function getNotionDatabases(): Promise<{ id: string, title: string }[]> {
  try {
    if (!notion) {
      throw new Error('Notion client not initialized');
    }

    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database',
      },
    });

    return response.results.map((database: any) => {
      const title = database.title.map((t: any) => t.plain_text).join('');
      return {
        id: database.id,
        title: title || 'Untitled Database',
      };
    });
  } catch (error) {
    log(`Error fetching Notion databases: ${error}`, 'notion');
    throw error;
  }
}

// Update an existing character page in Notion
export async function updateNotionPage(pageId: string, character: Character): Promise<void> {
  try {
    if (!notion) {
      throw new Error('Notion client not initialized');
    }

    // Validate the page ID exists
    try {
      await notion.pages.retrieve({ page_id: pageId });
    } catch (error) {
      log(`Invalid page ID: ${pageId}`, 'notion');
      throw new Error('Invalid Notion page ID');
    }

    // Update the page properties
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Name': {
          title: [
            {
              text: {
                content: character.name,
              },
            },
          ],
        },
        'Role': {
          rich_text: [
            {
              text: {
                content: character.role,
              },
            },
          ],
        },
        'Category': {
          select: {
            name: character.category,
          },
        },
        'Progress': {
          number: character.progress || 0,
        },
      },
    });

    log(`Character updated in Notion: ${pageId}`, 'notion');
  } catch (error) {
    log(`Error updating character in Notion: ${error}`, 'notion');
    throw error;
  }
}

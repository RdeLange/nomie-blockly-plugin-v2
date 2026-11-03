// The plugin's own text, in the language of the Nomie user (phase 18). English is the text itself, so a missing
// translation shows English. Nomie sends the language with `registered` (plugin.prefs.language).
export type Language = 'en' | 'nl';

// Dutch. The keys are the English text as it appears in the screens.
const NL: Record<string, string> = {
  Add: 'Toevoegen',
  Close: 'Sluiten',
  Settings: 'Instellingen',
  About: 'Over',
  Edit: 'Bewerken',
  Run: 'Uitvoeren',
  Delete: 'Verwijderen',
  Info: 'Info',
  Export: 'Exporteren',
  Duplicate: 'Dupliceren',
  Show: 'Tonen',
  Daily: 'Dagelijks',
  'Not scheduled': 'Niet gepland',
  'Last run': 'Laatste run',
  never: 'nooit',
  Back: 'Terug',
  'Back to workspaces': 'Terug naar de werkruimten',
  Save: 'Opslaan',
  Stop: 'Stoppen',
  Details: 'Details',
  Console: 'Console',
  Output: 'Uitvoer',
  Clear: 'Wissen',
  'Test run': 'Testrun',
  'Run for yesterday': 'Uitvoeren voor gisteren',
  'Run now': 'Nu uitvoeren',
  'Before a run': 'Voor een run',
  'No problems found.': 'Geen problemen gevonden.',
  'Run for days': 'Uitvoeren voor dagen',
  From: 'Van',
  To: 'Tot',
  'Remembered values': 'Onthouden waarden',
  Versions: 'Versies',
  'Export this workspace': 'Deze werkruimte exporteren',
  'Forget all': 'Alles vergeten',
  Scheduler: 'Planner',
  Backup: 'Back-up',
  Secrets: 'Geheimen',
  'Include remembered values': 'Onthouden waarden meenemen',
  'Run the schedule now': 'Planning nu uitvoeren',
  'Import and add': 'Importeren en toevoegen',
  'Import and replace': 'Importeren en vervangen',
  'New workspace': 'Nieuwe werkruimte',
  'Import a .wsp file': 'Een .wsp-bestand importeren',
  Templates: 'Sjablonen',
  'Try with a note': 'Proberen met een notitie',
  Try: 'Proberen',
  'Name used in notes': 'Naam in notities',
  Description: 'Beschrijving',
  Emoji: 'Emoji',
  Colour: 'Kleur',
  Schedule: 'Planning',
  'Test run (no notes are written)': 'Testrun (er worden geen notities geschreven)',
  'Loading…': 'Laden…',
  'Loading the editor…': 'De editor wordt geladen…',
  'Search all blocks': 'Alle blokken doorzoeken',
  Search: 'Zoeken',
  Name: 'Naam',
};

class I18nState {
  lang = $state<Language>('en');
}
export const i18n = new I18nState();

// Nomie's language (for example "nl-NL" or "en"); anything but Dutch is English
export const setLanguage = (raw: unknown) => {
  const text = typeof raw === 'string' ? raw.toLowerCase() : '';
  i18n.lang = text.startsWith('nl') ? 'nl' : 'en';
};

export const t = (text: string): string => (i18n.lang === 'nl' ? (NL[text] ?? text) : text);

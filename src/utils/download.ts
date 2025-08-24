import { SnippetSet } from '@/types/snippets';

export const downloadAsCSV = (data: string[], filename: string): void => {
  const csvContent = data.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAsJSON = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAsTXT = (data: string[], filename: string): void => {
  const txtContent = data.join('\n\n');
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportHooksCSV = (snippetSet: SnippetSet): void => {
  downloadAsCSV(snippetSet.socialHooks, `hooks-${snippetSet.id}.csv`);
};

export const exportSnippetsJSON = (snippetSet: SnippetSet): void => {
  downloadAsJSON(snippetSet, `snippets-${snippetSet.id}.json`);
};

export const exportQuotesTXT = (snippetSet: SnippetSet): void => {
  downloadAsTXT(snippetSet.pullQuotes, `quotes-${snippetSet.id}.txt`);
};

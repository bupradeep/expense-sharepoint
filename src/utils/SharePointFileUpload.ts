import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { RECEIPTS_LIBRARY_NAME } from './Constants';

export interface IUploadedFileInfo {
  fileName: string;
  serverRelativeUrl: string;
  size: number;
}

const DOCUMENT_LIBRARY_TEMPLATE = 101;
const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10 MB, matches PnPjs' own addUsingPath/addChunked guidance

// Uploads a single file into "<RECEIPTS_LIBRARY_NAME>/<claimNumber>/" on the current web, creating
// the library and/or the claim folder first if they don't already exist.
export async function uploadReceiptFile(
  context: WebPartContext,
  claimNumber: string,
  file: File
): Promise<IUploadedFileInfo> {
  const sp = spfi().using(SPFx(context));

  await sp.web.lists.ensure(RECEIPTS_LIBRARY_NAME, 'Expense claim receipt attachments', DOCUMENT_LIBRARY_TEMPLATE);

  const webServerRelativeUrl = context.pageContext.web.serverRelativeUrl;
  const folderPath = `${webServerRelativeUrl}/${RECEIPTS_LIBRARY_NAME}/${claimNumber}`;

  try {
    await sp.web.folders.addUsingPath(folderPath);
  } catch {
    // the claim folder likely already exists -- the upload below will surface a clear
    // error itself if something is actually wrong.
  }

  const folder = sp.web.getFolderByServerRelativePath(folderPath);
  const fileName = encodeURI(file.name);

  const result = file.size <= LARGE_FILE_THRESHOLD
    ? await folder.files.addUsingPath(fileName, file, { Overwrite: true })
    : await folder.files.addChunked(fileName, file, { Overwrite: true });

  return {
    fileName: file.name,
    serverRelativeUrl: result.ServerRelativeUrl,
    size: file.size
  };
}

export async function generateFileName(name:string, dir: string, fileType: string) {
    const date = new Date(); // today, now
    const dateClean = date.toISOString().slice(0, 10); // Timezone zero UTC offset
    const fileName = `${dir}/${name}-${dateClean}.${fileType}`;
    return fileName
}
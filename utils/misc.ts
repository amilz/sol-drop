function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
function printProgress(progress: number){
    let displayValue = (progress*100).toLocaleString(
        undefined, // leave undefined to use the visitor's browser 
                   // locale or a string like 'en-US' to override it.
        { minimumFractionDigits: 2 }
      );
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`  Status: ${displayValue} % Complete.`);
}

export { delay, printProgress }
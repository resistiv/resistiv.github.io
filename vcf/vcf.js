// This script is based off of yeka's https://dngr.us/vcf/include/save.js
// It is cut down to meet my needs; I wanted to self-host for my own business card.

var base64vcf = location.hash.substring(1);

// Borrowed from: https://stackoverflow.com/a/21797381
function base64ToUint8Array(base64)
{
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++)
    {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

document.addEventListener("DOMContentLoaded", () =>
{
    var bytes = base64ToUint8Array(base64vcf);
    var blob = new Blob([bytes], { type: "text/vcard" });
    var link = document.createElement("a");
	link.href = window.URL.createObjectURL(blob);
	link.download = "Contact.vcf";
	link.click();
});

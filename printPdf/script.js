//var pdfUrl = 'http://d2yw8fz9xfyr9z.cloudfront.net/manifest/f0aa9c1dadd418be.pdf';
console.log(Math.random() * 100000000000000000)

//window.print() //open the print dialog box
var printEvent = window.matchMedia('print');
    printEvent.addListener(function(printEnd) {
        console.log('********************************');
    if (!printEnd.matches) {
        // do whatever you wish to do
    };
});

function sendToPrinter (sURL) {
    function closePrint() {
        document.body.removeChild(this.__container__);
    }

    function setPrint (event, ee, e) {
        console.log('==================', event, event.currentTarget, event.currentTarget.id);
        var printFrame = document.getElementById(event.currentTarget.id);
        
        this.contentWindow.__container__ = this;
        //this.contentWindow.onbeforeunload = closePrint;
        //this.contentWindow.onafterprint = printFinished;
        this.contentWindow.focus(); // Required for IE
        this.contentWindow.print();
        window.setTimeout(function(){
            console.log('deleteFrame');
            //printFrame = document.getElementById(event.currentTarget.id);
            //document.body.removeChild(this.__container__);
            printFrame.parentNode.removeChild(printFrame);
        }, 30000);
        
        
       /* printFrame = document.getElementById("print-iframe");
        
        if (printFrame.contentWindow.matchMedia) {
            console.log('matchMedia');
            printFrame.contentWindow.matchMedia('print').addListener(function(media) {
                console.log('****************');
                if (media.matches) {
                    console.log('before print');
                    // before print
                } else {
                    // after print
                    console.log('after print');
                    closePrint();
                }
            });
        }
        
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        //document.body.removeChild(printFrame);
        console.log(this);
        //this.contentWindow.__container__ = this;
        //console.log(this);
        
        //this.contentWindow.onbeforeunload = closePrint;
        //this.contentWindow.onafterprint = closePrint;
        
        */
        
        
        
        //this.contentWindow.focus(); // Required for IE
        //this.contentWindow.print();
    }
    
    var oHiddFrame = document.createElement("iframe");
    oHiddFrame.onload = setPrint;
    oHiddFrame.style.visibility = "hidden";
    oHiddFrame.style.position = "fixed";
    oHiddFrame.style.right = "0";
    oHiddFrame.style.bottom = "0";
    oHiddFrame.src = sURL;
    oHiddFrame.id = 'print-iframe-' + Math.random();
    document.body.appendChild(oHiddFrame);
    
    
    
}

function getPdfAjax(pdfUrl) {
    console.log('ajax', pdfUrl);
    $.ajax({
        url: pdfUrl,
        xhrFields: {
            responseType: 'blob'
        },
        success: function (blob) {
            sendToPrinter(window.URL.createObjectURL(blob));
        },
        error: function (xhr, status, error) {
            console.error(xhr.responseText, status, error);
        }
    });
}

function getPdfXmlHttpRequest(pdfUrl) {
    console.log('XmlHttpRequest', pdfUrl);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", pdfUrl, true);
    xhr.responseType = "blob";
    //xhr.setRequestHeader('Access-Control-Allow-Headers', '*')
    xhr.onreadystatechange = function () {
        console.log('statechange', xhr.readyState, xhr.status);
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var blob = xhr.response;
                sendToPrinter(window.URL.createObjectURL(blob));
            } else {
                console.error('error getting pdf file, status ' + xhr.status);
            }
        }
    };
    xhr.send();
}

function print(pdfUrl) {
    //getPdfAjax(pdfUrl);
    getPdfXmlHttpRequest(pdfUrl);
}
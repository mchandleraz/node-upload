var socket=io(),main=document.querySelector("main");socket.on("new-image",function(e){var a=document.createElement("img");a.src="/t/"+e.name;var n=document.createElement("a");n.setAttribute("href","/"+e.name),n.appendChild(a);var t=document.createElement("div");t.className="image",t.appendChild(n),main.appendChild(t),main.insertBefore(t,main.firstChild)});
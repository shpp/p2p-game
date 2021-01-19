/**********************************

LOOPY!
- with edit & play mode

**********************************/

Loopy.MODE_EDIT = 0;
Loopy.MODE_PLAY = 1;

Loopy.TOOL_INK = 0;
Loopy.TOOL_DRAG = 1;
Loopy.TOOL_ERASE = 2;
Loopy.TOOL_LABEL = 3;

function Loopy(config){

	var self = this;
	self.config = config;

	// Loopy: EMBED???
	self.embedded = 1 ;//_getParameterByName("embed");
	self.embedded = !!parseInt(self.embedded); // force to Boolean

	// Offset & Scale?!?!
	self.offsetX = 0;
	self.offsetY = 0;
	self.offsetScale = 1;

	// Mouse
	Mouse.init(document.getElementById("canvasses")); // TODO: ugly fix, ew

	// Model
	self.model = new Model(self);

	// Loopy: SPEED!
	self.signalSpeed = 3;

	// Sidebar
	self.sidebar = new Sidebar(self);
	self.sidebar.showPage("Edit"); // start here

	// Play/Edit mode
	self.mode = Loopy.MODE_EDIT;

	// Tools
	self.toolbar = new Toolbar(self);
	self.tool = Loopy.TOOL_INK;
	self.ink = new Ink(self);
	self.drag = new Dragger(self);
	self.erase = new Eraser(self);
	self.label = new Labeller(self);

	// Play Controls
	self.playbar = new PlayControls(self);
	self.playbar.showPage("Editor"); // start here

	// Modal
	self.modal = new Modal(self);

	//////////
	// INIT //
	//////////

	self.init = function(){
		self.loadFromURL(); // try it.
	};

	///////////////////
	// UPDATE & DRAW //
	///////////////////

	// Update
	self.update = function(){
		Mouse.update();
		if(self.wobbleControls>=0) self.wobbleControls--; // wobble
		if(!self.modal.isShowing){ // modAl
			self.model.update(); // modEl
		}
	};
	setInterval(self.update, 1000/30); // 30 FPS, why not.

	// Draw
	self.draw = function(){
		if(!self.modal.isShowing){ // modAl
			self.model.draw(); // modEl
		}
		requestAnimationFrame(self.draw);
	};

	// TODO: Smarter drawing of Ink, Edges, and Nodes
	// (only Nodes need redrawing often. And only in PLAY mode.)

	//////////////////////
	// PLAY & EDIT MODE //
	//////////////////////

	self.showPlayTutorial = false;
	self.wobbleControls = -1;
	self.setMode = function(mode){

		self.mode = mode;
		publish("loopy/mode");

		// Play mode!
		if(mode==Loopy.MODE_PLAY){
			self.showPlayTutorial = true; // show once!
			if(!self.embedded) self.wobbleControls=45; // only if NOT embedded
			self.sidebar.showPage("Edit");
			self.playbar.showPage("Player");
			self.sidebar.dom.setAttribute("mode","play");
			self.toolbar.dom.setAttribute("mode","play");
			document.getElementById("canvasses").removeAttribute("cursor"); // TODO: EVENT BASED
		}else{
			publish("model/reset");
		}

		// Edit mode!
		if(mode==Loopy.MODE_EDIT){
			self.showPlayTutorial = false; // donezo
			self.wobbleControls = -1; // donezo
			self.sidebar.showPage("Edit");
			self.playbar.showPage("Editor");
			self.sidebar.dom.setAttribute("mode","edit");
			self.toolbar.dom.setAttribute("mode","edit");
			document.getElementById("canvasses").setAttribute("cursor", self.toolbar.currentTool); // TODO: EVENT BASED
		}

	};

	/////////////////
	// SAVE & LOAD //
	/////////////////

	self.dirty = false;

	// YOU'RE A DIRTY BOY
	subscribe("model/changed", function(){
		if(!self.embedded) self.dirty = true;
	});

	self.saveToURL = function(embed){

		// Create link
		var dataString = self.model.serialize();
		var uri = dataString; // encodeURIComponent(dataString);
		var base = window.location.origin + window.location.pathname;
		var historyLink = base+"?data="+uri;
		var link;
		if(embed){
			link = base+"?embed=1&data="+uri;
		}else{
			link = historyLink;
		}

		// NO LONGER DIRTY!
		self.dirty = false;

		// PUSH TO HISTORY
		window.history.replaceState(null, null, historyLink);

		return link;

	};

	// "BLANK START" DATA:
	// var _blankData = "[[[1,403,223,1,%22something%22,4],[2,405,382,1,%22something%2520else%22,5]],[[2,1,94,-1,0],[1,2,89,1,0]],[[609,311,%22need%2520ideas%2520on%2520what%2520to%250Asimulate%253F%2520how%2520about%253A%250A%250A%25E3%2583%25BBtechnology%250A%25E3%2583%25BBenvironment%250A%25E3%2583%25BBeconomics%250A%25E3%2583%25BBbusiness%250A%25E3%2583%25BBpolitics%250A%25E3%2583%25BBculture%250A%25E3%2583%25BBpsychology%250A%250Aor%2520better%2520yet%252C%2520a%250A*combination*%2520of%250Athose%2520systems.%250Ahappy%2520modeling!%22]],2%5D";
	var _blankData = "[[[1,197,288,0.5,%22%D1%85%D0%BE%D1%87%D1%83%20%D0%B7%D0%BD%D0%B0%D0%BD%D1%8C%22,4],[2,486,102,0,%22%D1%81%D0%BF%D0%B8%D1%81%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F%22,2],[3,329,529,0,%22%D0%A2%D0%A3%D0%A2%20%D0%9D%D0%95%20%D0%9D%D0%90%D0%92%D0%A7%D0%90%D0%A2%D0%AC%22,1],[5,828,396,0,%22%D0%BA%D0%B0%D1%87%20%26%20%D0%B4%D0%BE%D1%81%D0%B2%D1%96%D0%B4%22,3],[6,801,88,0,%22%D0%B3%D0%B0%D1%80%D0%BD%D1%96%20%D1%80%D0%B5%D0%B2'%D1%8E%22,3],[7,645,542,0,%22%D0%BF%D0%BE%D0%B3%D0%B0%D0%BD%D1%96%20%D1%80%D0%B5%D0%B2'%D1%8E%22,0],[9,948,182,0.33,%22%D1%85%D0%BE%D1%82%D1%96%D1%82%D0%B8%20%D1%80%D0%B5%D0%B2'%D1%8E%22,4],[10,693,260,0.5,%22%D0%B2%D0%BE%D0%BB%D0%BE%D0%BD%D1%82%D0%B5%D1%80%22,5],[11,337,370,0,%22%22%D0%BF%D0%BE%D0%BC%D1%96%D1%87%D0%BD%D0%B8%D0%BA%22%22,1],[12,580,396,0,%22kick%20%26%20ban%22,5],[13,237,94,0,%22%D0%BE%D0%B1%D0%BC%D0%B0%D0%BD%22,0],[14,1022,347,0.5,%22%D0%B2%20%D0%A8%2B%2B%20%D0%BA%D1%80%D1%83%D1%82%D0%BE%22,3],[15,1018,499,0,%22p2p%20%3D%20%D0%BA%D1%80%D1%83%D1%82%D0%BE%22,3]],[[7,3,45,1,0],[6,5,6,1,0],[5,7,36,-1,0],[2,6,-33,-1,0],[10,6,-7,1,0],[12,2,-39,-1,0],[12,11,14,-1,0],[1,2,35,-1,0],[11,2,52,1,0],[2,13,-9,1,0],[3,1,45,-1,0],[5,14,-4,1,0],[5,15,-13,1,0],[5,9,-11,1,0]],[[804,552,%22%D0%BE%D0%B7%D0%BD%D0%B0%D1%87%D0%B0%D1%94%0A%D0%BC%D0%B5%D0%BD%D1%88%D0%B5%0A%D0%BF%D0%BE%D0%B3%D0%B0%D0%BD%D0%B8%D1%85%0A%D1%80%D0%B5%D0%B2'%D1%8E%22],[635,71,%22%D0%B7%D1%96%20%D1%81%D0%BF%D0%B8%D1%81%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F%D0%BC%0A%D0%B2%D0%BC%D0%B8%D1%80%D0%B0%D1%8E%D1%82%D1%8C%0A%D1%85%D0%BE%D1%80%D0%BE%D1%88%D1%96%20%D1%80%D0%B5%D0%B2'%D1%8E%22],[197,210,%22%D0%BC%D0%BE%D1%82%D0%B8%D0%B2%D0%B0%D1%86%D1%96%D1%8F%20%0A%D0%BD%D0%B0%D0%B2%D1%87%D0%B8%D1%82%D0%B8%D1%81%D1%8F%22],[494,530,%22%D0%BF%D0%BE%D0%B3%D0%B0%D0%BD%D1%96%20%D1%80%D0%B5%D0%B2'%D1%8E%0A%D0%97%D0%9D%D0%98%D0%A9%D0%A3%D0%AE%D0%A2%D0%AC%20%0Ap2p%22],[204,533,%22%D1%8F%D0%BA%D1%89%D0%BE%20%D0%B2%20%D0%A8%2B%2B%20%0A%D0%BD%D0%B5%20%D0%B2%D1%87%D0%B0%D1%82%D1%8C%0A%D1%82%D0%BE%20%D0%B7%D0%BC%D1%96%D0%BD%D1%8E%D1%8E%D1%82%D1%8C%D1%81%D1%8F%20%0A%D1%86%D1%96%D0%BB%D1%96...%22],[443,296,%22%22%D0%BF%D0%BE%D0%BC%D1%96%D1%87%D0%BD%D0%B8%D0%BA%D0%B8%22%0A%D0%B4%D0%B0%D1%8E%D1%82%D1%8C%20%D1%81%D0%BF%D0%B8%D1%81%D1%83%D0%B2%D0%B0%D1%82%D0%B8%0A%D1%82%D0%B0%2F%D0%B0%D0%B1%D0%BE%20%0A%D0%B4%D0%BE%D0%B7%D0%B2%D0%BE%D0%BB%D1%8F%D1%8E%D1%82%D1%8C%0A%D0%BF%D0%BE%D0%B3%D0%B0%D0%BD%D0%BE%20%D0%B2%D1%87%D0%B8%D1%82%D0%B8%D1%81%D1%8C%0A%D1%96%D0%BD%D1%88%D0%B8%D0%BC%22],[1049,279,%22%3A)%22],[830,457,%22%3AD%22]],15]";
	// var _blankData = "[[[1,197,288,0.5,%2522%25D1%2585%25D0%25BE%25D1%2587%25D1%2583%2520%25D0%25B7%25D0%25BD%25D0%25B0%25D0%25BD%25D1%258C%2522,4],[2,486,102,0,%2522%25D1%2581%25D0%25BF%25D0%25B8%25D1%2581%25D1%2583%25D0%25B2%25D0%25B0%25D0%25BD%25D0%25BD%25D1%258F%2522,2],[3,329,529,0,%2522%25D0%25A2%25D0%25A3%25D0%25A2%2520%25D0%259D%25D0%2595%2520%25D0%259D%25D0%2590%25D0%2592%25D0%25A7%25D0%2590%25D0%25A2%25D0%25AC%2522,1],[5,828,396,0,%2522%25D0%25BA%25D0%25B0%25D1%2587%2520%2526%2520%25D0%25B4%25D0%25BE%25D1%2581%25D0%25B2%25D1%2596%25D0%25B4%2522,3],[6,801,88,0,%2522%25D0%25B3%25D0%25B0%25D1%2580%25D0%25BD%25D1%2596%2520%25D1%2580%25D0%25B5%25D0%25B2'%25D1%258E%2522,3],[7,645,542,0,%2522%25D0%25BF%25D0%25BE%25D0%25B3%25D0%25B0%25D0%25BD%25D1%2596%2520%25D1%2580%25D0%25B5%25D0%25B2'%25D1%258E%2522,0],[9,948,182,0.33,%2522%25D1%2585%25D0%25BE%25D1%2582%25D1%2596%25D1%2582%25D0%25B8%2520%25D1%2580%25D0%25B5%25D0%25B2'%25D1%258E%2522,4],[10,693,260,0.5,%2522%25D0%25B2%25D0%25BE%25D0%25BB%25D0%25BE%25D0%25BD%25D1%2582%25D0%25B5%25D1%2580%2522,5],[11,337,370,0,%2522%2522%25D0%25BF%25D0%25BE%25D0%25BC%25D1%2596%25D1%2587%25D0%25BD%25D0%25B8%25D0%25BA%2522%2522,1],[12,580,396,0,%2522kick%2520%2526%2520ban%2522,5],[13,237,94,0,%2522%25D0%25BE%25D0%25B1%25D0%25BC%25D0%25B0%25D0%25BD%2522,0],[14,1022,347,0.5,%2522%25D0%25B2%2520%25D0%25A8%252B%252B%2520%25D0%25BA%25D1%2580%25D1%2583%25D1%2582%25D0%25BE%2522,3],[15,1018,499,0,%2522p2p%2520%253D%2520%25D0%25BA%25D1%2580%25D1%2583%25D1%2582%25D0%25BE%2522,3]],[[7,3,45,1,0],[6,5,6,1,0],[5,7,36,-1,0],[2,6,-33,-1,0],[10,6,-7,1,0],[12,2,-39,-1,0],[12,11,14,-1,0],[1,2,35,-1,0],[11,2,52,1,0],[2,13,-9,1,0],[3,1,45,-1,0],[5,14,-4,1,0],[5,15,-13,1,0],[5,9,-11,1,0]],[[804,552,%2522%25D0%25BE%25D0%25B7%25D0%25BD%25D0%25B0%25D1%2587%25D0%25B0%25D1%2594%250A%25D0%25BC%25D0%25B5%25D0%25BD%25D1%2588%25D0%25B5%250A%25D0%25BF%25D0%25BE%25D0%25B3%25D0%25B0%25D0%25BD%25D0%25B8%25D1%2585%250A%25D1%2580%25D0%25B5%25D0%25B2'%25D1%258E%2522],[635,71,%2522%25D0%25B7%25D1%2596%2520%25D1%2581%25D0%25BF%25D0%25B8%25D1%2581%25D1%2583%25D0%25B2%25D0%25B0%25D0%25BD%25D0%25BD%25D1%258F%25D0%25BC%250A%25D0%25B2%25D0%25BC%25D0%25B8%25D1%2580%25D0%25B0%25D1%258E%25D1%2582%25D1%258C%250A%25D1%2585%25D0%25BE%25D1%2580%25D0%25BE%25D1%2588%25D1%2596%2520%25D1%2580%25D0%25B5%25D0%25B2'%25D1%258E%2522],[197,210,%2522%25D0%25BC%25D0%25BE%25D1%2582%25D0%25B8%25D0%25B2%25D0%25B0%25D1%2586%25D1%2596%25D1%258F%2520%250A%25D0%25BD%25D0%25B0%25D0%25B2%25D1%2587%25D0%25B8%25D1%2582%25D0%25B8%25D1%2581%25D1%258F%2522],[494,530,%2522%25D0%25BF%25D0%25BE%25D0%25B3%25D0%25B0%25D0%25BD%25D1%2596%2520%25D1%2580%25D0%25B5%25D0%25B2'%25D1%258E%250A%25D0%2597%25D0%259D%25D0%2598%25D0%25A9%25D0%25A3%25D0%25AE%25D0%25A2%25D0%25AC%2520%250Ap2p%2522],[204,533,%2522%25D1%258F%25D0%25BA%25D1%2589%25D0%25BE%2520%25D0%25B2%2520%25D0%25A8%252B%252B%2520%250A%25D0%25BD%25D0%25B5%2520%25D0%25B2%25D1%2587%25D0%25B0%25D1%2582%25D1%258C%250A%25D1%2582%25D0%25BE%2520%25D0%25B7%25D0%25BC%25D1%2596%25D0%25BD%25D1%258E%25D1%258E%25D1%2582%25D1%258C%25D1%2581%25D1%258F%2520%250A%25D1%2586%25D1%2596%25D0%25BB%25D1%2596...%2522],[443,296,%2522%2522%25D0%25BF%25D0%25BE%25D0%25BC%25D1%2596%25D1%2587%25D0%25BD%25D0%25B8%25D0%25BA%25D0%25B8%2522%250A%25D0%25B4%25D0%25B0%25D1%258E%25D1%2582%25D1%258C%2520%25D1%2581%25D0%25BF%25D0%25B8%25D1%2581%25D1%2583%25D0%25B2%25D0%25B0%25D1%2582%25D0%25B8%250A%25D1%2582%25D0%25B0%252F%25D0%25B0%25D0%25B1%25D0%25BE%2520%250A%25D0%25B4%25D0%25BE%25D0%25B7%25D0%25B2%25D0%25BE%25D0%25BB%25D1%258F%25D1%258E%25D1%2582%25D1%258C%250A%25D0%25BF%25D0%25BE%25D0%25B3%25D0%25B0%25D0%25BD%25D0%25BE%2520%25D0%25B2%25D1%2587%25D0%25B8%25D1%2582%25D0%25B8%25D1%2581%25D1%258C%250A%25D1%2596%25D0%25BD%25D1%2588%25D0%25B8%25D0%25BC%2522],[1049,279,%2522%253A)%2522],[830,457,%2522%253AD%2522]],15]";

	self.loadFromURL = function(){
		var data = _getParameterByName("data");
		if(!data) data=decodeURIComponent(_blankData).replace(/""(.+?)"/g, '"\\"$1\\"').replace(/\n/g, "\\n");
		self.model.deserialize(data);
	};


	///////////////////////////
	//////// EMBEDDED? ////////
	///////////////////////////

	self.init();

	// Hide all that UI
	self.toolbar.dom.style.display = "none";
	self.sidebar.dom.style.display = "none";

	if(self.embedded){



		// If *NO UI AT ALL*
		var noUI = !!parseInt(_getParameterByName("no_ui")); // force to Boolean
		if(noUI){
			_PADDING_BOTTOM = _PADDING;
			self.playbar.dom.style.display = "none";
		}

		// Fullscreen canvas
		document.getElementById("canvasses").setAttribute("fullscreen","yes");
		self.playbar.dom.setAttribute("fullscreen","yes");
		publish("resize");

		// Center & SCALE The Model
		self.model.center(true);
		subscribe("resize",function(){
			self.model.center(true);
		});

		// Autoplay!
		self.setMode(Loopy.MODE_PLAY);

		// Also, HACK: auto signal
		var signal = _getParameterByName("signal");
		if(signal){
			signal = JSON.parse(signal);
			var node = self.model.getNode(signal[0]);
			node.takeSignal({
				delta: signal[1]*0.33
			});
		}

	}else{

		// Center all the nodes & labels

		// If no nodes & no labels, forget it.
		if(self.model.nodes.length>0 || self.model.labels.length>0){

			// Get bounds of ALL objects...
			var bounds = self.model.getBounds();
			var left = bounds.left;
			var top = bounds.top;
			var right = bounds.right;
			var bottom = bounds.bottom;

			// Re-center!
			var canvasses = document.getElementById("canvasses");
			var cx = (left+right)/2;
			var cy = (top+bottom)/2;
			var offsetX = (canvasses.clientWidth+50)/2 - cx;
			var offsetY = (canvasses.clientHeight-80)/2 - cy;

			// MOVE ALL NODES
			for(var i=0;i<self.model.nodes.length;i++){
				var node = self.model.nodes[i];
				node.x += offsetX;
				node.y += offsetY;
			}

			// MOVE ALL LABELS
			for(var i=0;i<self.model.labels.length;i++){
				var label = self.model.labels[i];
				label.x += offsetX;
				label.y += offsetY;
			}

		}

	}

	// NOT DIRTY, THANKS
	self.dirty = false;

	// SHOW ME, THANKS
	document.body.style.opacity = "";

	// GO.
	requestAnimationFrame(self.draw);


}

	var newFragment=new Event('fragment');
	var startTransition=new Event('startTransition');
	var endTransition=new Event('endTransition');
	function transitionend(event){
		document.dispatchEvent(endTransition);
	}
	function transitionstart(event){
		document.dispatchEvent(startTransition);
	}
	/* jump to a specific fragment */
	function jumpToTime(n){
		 while(time<n) next(false,false,false);
		 while(time>n) prev(false,false);
		document.dispatchEvent(newFragment);
		checkHash();
	}
	/* jump to section n */
	function jumpToSection(n){
		let sections=document.getElementsByTagName("section");
		let newTime=0;let m=0;
		while(m++<n) if(sections[m].time!=null) newTime=sections[m].time;
		jumpToTime(newTime);
	}
	function getSectionNb(){
		let sections=document.getElementsByTagName("section");
		let sectionNb=0;
		while ((sectionNb<sections.length) && ((time>=sections[sectionNb].time) || (typeof sections[sectionNb].time==='undefined'))){
			sectionNb++;
		}
		return sectionNb;
	}
	function checkHash(){
		let sectionNb=getSectionNb();
		var re=/(.*#(\d*))/
		if ((re.exec(document.URL)==null) || (re.exec(document.URL)[2]!=sectionNb)) {
			_check_hash=false;
			location.hash=sectionNb;
		}
	}
	/* get active section */
	function getActiveSection(){
		let sections=document.getElementsByTagName("section");
		let n=0;let nt=0;
		while(nt<time && (n+1) < sections.length){
			n++;
			if(sections[n].time!=null) nt=sections[n].time;
		}
		return n;
	}
	/* Add the values of the selector to the inline sytle element */
	function AddProperty(element,property){
		var rules= window.getComputedStyle(element);
		var value=rules.getPropertyValue(property);
		if(value=="") value=0;
		value=parseInt(value)+1;
		element.style.setProperty(property,value);	}
	/* substract the values of the selector to the inline sytle element */
	function SubStractProperty(element,property){
		var rules= window.getComputedStyle(element);
		var value=rules.getPropertyValue(property);
		if(value=="") value=0;
		value=parseInt(value)-1;
		element.style.setProperty(property,value);}
	/* Return fragment=  an array containing the fragments with their description
					// fragment[i].target = an array with the list of css path targets (optional, default= this)
					// fragment[i].add = list of attributes to increment
					// fragment[i].substract = list of attibutes to decrement
					// fragment[i].toggle = list of classes to add/remove
					// fragment[i].duration = duration of the transition (optional, default = current)
					// fragment[i].time = time step to apply the fragment(optional, default = computed)
		Syntax
			fragment="#time_step[element_id]{class1 attribute1++ attribute2--} transition_duration s"
		Effect
			From the time step (time_step to time_step+1)
					toggle class1
					increment attribute1
					decrement attribute2
					
		 	From the time step (time_step+1 to time_step)
					toggle class1 and class2 to element_id
					substract class3 values of the properties of class3 to element_id.style
					addclass4 values of the properties of class3 to element_id.style */
	function getFragments(element) {
		var fragmentElements=element.querySelectorAll("[fragments]");
		var current_time=0;
		var re=new RegExp('[ ]*(?:(#|\\+|-)([0-9]+))?[ ]*(?:\\[([^[]*)\\])?[ ]*(?:\{([^}]*))\}[ ]*(?:([0-9]+\.?[0-9]*)s)?[ ]*(?:([0-9]+\.?[0-9]*)s)?','g');
		var fragment=new Array();
		var j=0;
		for(var i=0;i<fragmentElements.length;i++){
			var fragmentProperties=fragmentElements[i].getAttribute("fragments");
			while(Properties=re.exec(fragmentProperties)){
				fragment.push({});
				//------------------- time ------------------- //
				if(Properties[1]=="#") {
					if(Properties[2]!=null)
						{fragment[j].time=parseInt(Properties[2]);}
					else {current_time++; fragment[j].time=current_time;}}
				else 
					if(Properties[1]=="+") {fragment[j].time=current_time+parseInt(Properties[2]);}
			 		else
			 		if(Properties[1]=="-") {fragment[j].time=current_time-parseInt(Properties[2]);}
			 		else  
			 			{current_time++; fragment[j].time=current_time;}
				fragmentElements[i].time=fragment[j].time;
			 	// ------------------ duration -------------- //
				if(Properties[5]) {fragment[j].duration=Properties[5];}
				else {fragment[j].duration=0;}
				if(Properties[6]) fragment[j].delay=Properties[6];
				else fragment[j].delay=0;

				// ----------------- target(s) --------------- //
				if(Properties[3]!=null) {
					TheElements=Properties[3].split(",");
					fragment[j].target=[];
					for(var J=0; J<TheElements.length; J++)
						if (TheElements[J]=="this") fragment[j].target[J]=fragmentElements[i];
						else {
							fragment[j].target[J]=document.getElementById(TheElements[J])
						}
				}
				else fragment[j].target=[fragmentElements[i]];
				if ((fragment[j].duration!==0)||(fragment[j].delay!==0))
					for(let J=0; J<fragment[j].target.length; J++){
							fragment[j].target[J].addEventListener("transitionend",transitionend)
//							fragment[j].target[J].addEventListener("transitionstart",transitionstart)
					}

				// ----------------- toggle ----------------- //
					var regtoggle=new RegExp('(^| )([^ +-]+)','g');
					fragment[j].toggle=new Array();
					while(toToggle=regtoggle.exec(Properties[4])){
						fragment[j].toggle.push(toToggle[2]);}
				// ----------------- add ----------------- //
					var regadd=new RegExp('([^ ]+)\\+\\+','g');
					fragment[j].add=new Array();
					while(toAdd=regadd.exec(Properties[4]))
						fragment[j].add.push(toAdd[1]);
				// ----------------- substract ----------------- //
					var regsubstract=new RegExp('([^ ]+)--','g');
					fragment[j].substract=new Array();
					while(toSubtract=regsubstract.exec(Properties[4]))
						fragment[j].substract.push(toSubtract[1]);
				j++;}}
		// sort the fragments according to time
		fragment.sort(function(a,b){return a.time-b.time;})
		return fragment;}
	function upDateArrows(){				// Arrows are set to active or inactive depending on the time line
		if(el=document.getElementById("arrowDown"))
			if(time<NbTimeSteps){
				el.classList.remove("inactive");
				el.addEventListener('click',next);
			} else {
				el.classList.add("inactive");
				el.removeEventListener('click',next); // Ca n'existe pas :( :( :( 
			}
		if(el=document.getElementById("arrowUp"))
		{
			if(time>0)
			{
				el.classList.remove("inactive");
				el.addEventListener('click',prev);
			} else {
				el.classList.add("inactive");
				el.removeEventListener('click',prev);
		}}}
	function resetDuration(event){
		if(event.target.duration!=undefined) {
			console.log("pouet")
			event.target.style.setProperty("transition",event.target.duration);
		}
		event.target.removeEventListener("transitionend",resetDuration)
	}
	function resetDelay(event){
		if(event.target.delay!=undefined) {
			event.target.style.setProperty("transition",event.target.delay);
		}
		event.target.removeEventListener("transitionend",resetDelay)
	}
	function next(duration=true,delay=true,sendEvent=true){						// Go to the next time step
		if(sendEvent) document.dispatchEvent(newFragment);	// a new fragment as been triggerd
		time++;			// increase time counter
		// Does the section have changed ?
		if(duration) checkHash();
		for(var i=0;i<DocFragments.length;i++){	// We look at all the fragments
			var frag=DocFragments[i];			// Get the i-th fragment
			if(frag.time==time){				// Is the fragment activated at the current time
				if (frag.duration!==0)
					for(let J=0; J<frag.target.length; J++){
						if(typeof frag.target[J].duration==="undefined"){
							// save current value of transition duration
							frag.target[J].duration=frag.target[J].style.transition;
							// We add a event Listener to go back to initial duration after transition
							frag.target[J].addEventListener("transitionend",resetDuration)
						}
						if(duration)
							frag.target[J].style.transition="all "+frag.duration+"s";
						else
							frag.target[J].style.transition="all 0s";}
				if (frag.delay!==0)
					for(let J=0; J<frag.target.length; J++){
						if(typeof frag.target[J].delay==="undefined"){
							// save current value of transition duration
							frag.target[J].delay=frag.target[J].style.transitionDelay;
							// We add a event Listener to go back to initial duration after transition
							frag.target[J].addEventListener("transitionend",resetDelay)}
						if(typeof frag.target[J].delay==="undefined"){
							// save current value of transition duration
							frag.target[J].delay=frag.target[J].style.transitionDelay;
						}
						if(delay)
							frag.target[J].style.transitionDelay=frag.delay+"s";
						else
							frag.target[J].style.transitionDelay="0s";
				}
				for(var j=0;j<frag.toggle.length;j++) for(var J=0; J<frag.target.length; J++)
					frag.target[J].classList.toggle(frag.toggle[j]);
				for(var j=0;j<frag.add.length;j++) for(var J=0; J<frag.target.length; J++)
					AddProperty(frag.target[J],frag.add[j]);
				for(var j=0;j<frag.substract.length;j++) for(var J=0; J<frag.target.length; J++)
					SubStractProperty(frag.target[J],frag.substract[j]);
				}}
		upDateArrows();}
				//for(var j=0;j<frag.substract.length;j++) SubstractProporties(frag.target,frag.substract[j]);}}}
	function prev(duration=true,sendEvent=true){						// Go the previous time step
		if(sendEvent) document.dispatchEvent(newFragment);
		for(var i=0;i<DocFragments.length;i++){
			var frag=DocFragments[i];
			if(frag.time==time){
				if (frag.duration!=='') for(var J=0; J<frag.target.length; J++)
					{if(duration)
						frag.target[J].style.transition="all "+frag.duration+"s";
					else frag.target[J].style.transition="all 0s";}
				for(var j=0;j<frag.add.length;j++) for(var J=0; J<frag.target.length; J++)
					SubStractProperty(frag.target[J],frag.add[j]);
				for(var j=0;j<frag.substract.length;j++) for(var J=0; J<frag.target.length; J++)
					AddProperty(frag.target[J],frag.substract[j]);
				for(var j=0;j<frag.toggle.length;j++) for(var J=0; J<frag.target.length; J++)
					frag.target[J].classList.toggle(frag.toggle[j]);
			}}
		time--;			// increase time counter
		// Does the section have changed ?
		if(duration) checkHash();
		upDateArrows();}

	NbTimeSteps=0;
	function jump(e){
		e.stopPropagation();
		document.body.classList.toggle("navigate");
		window.scrollTo(0,0);
		let sections=document.getElementsByTagName("section");
		var sectionNb=0;
		for(let i=0;i<sections.length;i++){
			if(this==sections[i]) sectionNb=i+1;
			sections[i].removeEventListener("click",jump,true);
		}
		location.hash=sectionNb;
	}
	_check_hash=true;

	function HashChange(){
		if(_check_hash){
			var re=/(.*#(\d*))/
			pageNb=re.exec(document.URL);
			if(pageNb!=null) jumpToSection(pageNb[2]-1);
		}
		_check_hash=true;
	}
	window.addEventListener('hashchange',HashChange);
	var speaker=null;
	
	function initFrag(){
		time=0;
		DocFragments=getFragments(document);	// We get all the fragments of the presentation
		if(DocFragments.length!=0)
				{NbTimeSteps=DocFragments[DocFragments.length-1].time;}
		else NbTimesSteps=0;
		upDateArrows();
		HashChange();
		document.addEventListener('keydown', function(event) {
			if(event.keyCode==27)
			// Navigate out or Navigate in
			{
				document.getElementById("slides").style.transition="all 0s";
				let sections=document.getElementsByTagName("section");
				for(let section of sections) section.style.transition="all 0s";
				document.body.classList.toggle("navigate");
				if (document.body.classList.contains("navigate")){
					// Navigate
					// Get the section it is
					var nsection=getActiveSection();
					let sections=document.getElementsByTagName("section");
					Element.prototype.documentOffsetTop = function () {
						return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop() : 0 );
					};
					Element.prototype.documentOffsetLeft = function () {
						return this.offsetLeft + ( this.offsetParent ? this.offsetParent.documentOffsetLeft() : 0 );
					};
					var top=sections[nsection].documentOffsetTop()+ ( window.innerHeight / 2 );
					var left=sections[nsection].documentOffsetLeft()+ ( window.innerWidth / 2 );
					window.scrollTo(left*0.2-window.innerWidth/2,top*0.2-window.innerHeight/2);

					for(let section of sections)
						section.addEventListener("click",jump,true);
				} else
				{	// Navigate out
					window.scrollTo(0,0);
					let sections=document.getElementsByTagName("section");
					for(let section of sections) 
						section.removeEventListener("click",jump);
					
				}
			}
			
			// 13,32,40,34 (return/space/arrow down/Arrow down/arrow left))
			if ((event.keyCode==13) || (event.keyCode==32) || (event.keyCode==40)|| (event.keyCode==34)|| (event.keyCode==39)){
				event.preventDefault();
				if (time<NbTimeSteps) next();}
			// 38,33 (arrow up/Arrow up/arrow left)
			if ((event.keyCode==38) || (event.keyCode==33)  || (event.keyCode==37)) {
				event.preventDefault();
				if (time>0) prev();}
			//First attempt to create a speaker view
			/*
			if (event.keyCode==83) {
				speaker=window.open("speaker.html","Notes conf",'width=1100,height=700' );
				//sent current page to the speaker
			}*/

			// Send the event to the speaker
			//if(speaker) speaker.postMessage(event.keyCode);
	        }, false);
		// Listen to messages sent
		/*
		window.addEventListener('message',function(event) {
			console.log('message received:  ' + event.data,event);
			//event.source.postMessage('holla back youngin!',event.origin);
		},false);*/
	}

/*****************************/
/* launch js on class change */
/*****************************/
/* forward(target) is launched on addition
 * backward(target) is launched on deletion */
function watchClassToggle(target,className,forward,backard){
	var observer = new MutationObserver(
		function(mutations) {
			mutations.forEach(
				function(mutation) {
					if (mutation.attributeName==="class") {
						if(target.classList.contains(className)) forward(target);
						else backard(target);
					}
				});
			}
		);
	observer.observe(target,{attributes:true});
}

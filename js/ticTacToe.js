/* 
    Your app's JS goes here.
    
    --> rename this file to yourappname.css and 
        change .then('js/myapp.js') in index.html
        appropriately
        
    --> change all occurances of "MyApp" in this file
        to your app's actual name! (preferrably camel-cased)
*/

ticTacToe = {
    xmppDomain: 'proto.encorelab.org',
    groupchatRoom: 's3@conference.proto.encorelab.org',
    //rollcallURL: 'http://rollcall.proto.encorelab.org',
    //rollcallURL: 'http://localhost:3000',
    rollcallURL: 'http://localhost:8000/rollcall',
    
    // this is called in index.html
    init: function() {
        console.log("Initializing...")
        
        Sail.modules
            .load('Rollcall.Authenticator', {mode: 'picker'})
            .load('AuthStatusWidget')
            .load('Strophe.AutoConnector')
            .thenRun(function () {
                // takes care of event-binding magic... don't touch this
                Sail.autobindEvents(ticTacToe)
                
                console.log("Initialized.")
                $(Sail.app).trigger('initialized')
                return true
            })
    },
    
    authenticate: function() {
        console.log("Authenticating...")
        
        // Note that we use Rollcall for authentication here.
        // See: https://github.com/educoder/rollcall
        
        ticTacToe.rollcall = new Rollcall.Client(ticTacToe.rollcallURL)
        ticTacToe.token = ticTacToe.rollcall.getCurrentToken()
        
        if (!ticTacToe.token) {
            Rollcall.Authenticator.requestLogin()
        } else {
            ticTacToe.rollcall.fetchSessionForToken(ticTacToe.token, function(data) {
                ticTacToe.session = data.session
                $(ticTacToe).trigger('authenticated')
            })
        }
    },
    
    events: {
        sail: {
            /* 
               sail (xmpp) events
               --> add additional XMPP-based event handlers for your app here
            */
            
            // triggered via sail (XMPP) event generated in selfJoined...
            // this intercepts an event in XMPP groupchat that looks like this:
            //
            //   {"eventType":"here","payload":{"who":"test1"}}
//            here: function(sev) {
//                payload = sev.payload
//                
//                $('#welcome').text("Welcome "+payload.who+"!")
//                    .show('drop', {duration: 'slow', direction: 'up'})
//            },
            here: function(sev) {
                payload = sev.payload
                
                $('#board').show()
                
            },
            
            // this would intercept an event in XMPP groupchat that looks like this:
            //
            //   {"eventType":"my_event","payload":{}}
            // 
            // or just:
            //
            //   {"eventType":"my_event"}
            //   {"eventType":"showPiece","payload":{"piece":"x5"}}
            //GET MATT TO EXPLAIN WHY ITS EV NAD NOT SEV HERE

            hidePiece: function(ev, sev) {
            	tile = ev.payload.piece
            	tile = '#' + tile
            	$(tile).hide()
            },
            showPiece: function(ev, sev) {
            	tile = ev.payload.piece
            	tile = '#' + tile
            	$(tile).show()
            },
            hidex5: function(ev, sev) {
            	$('#x5').hide()
            },
            
            // another way to respond to sail events it to map them onto local events.
            // the following code would cause the 'foo' sail event to trigger the local
            // 'foobar' event -- you would also set up an 'foobar' event handler 
            // further down (under the events hash, outside of events.sail);
            // in this case the foobar event handler would receive two arguments:
            // a standard javascript event (`ev`) and the sail event (`sev`)
            foo: 'foobar'
        },
        
        
        /* 
           local events
           --> add additional local event handlers for your app here
        */
        
        initialized: function(ev) {
            ticTacToe.authenticate()
        },
        
        // this is triggered by $(MyApp).trigger('connected')
        // in sail.js after the user passes authentication and
        // connects to the XMPP server
        connected: function(ev) {
      	    Sail.app.groupchat.join()
            
            $('#username').text(session.account.login)
      	    $('#connecting').hide()						//what's the correct way to do this initial hiding? Set as hidden in the html, I assume
      	    for (i=1; i < 10; i++) {
      	    	xInit = '#x' + i
      	    	$(xInit).hide()
      	    	$(xInit).click(function() {
      	    	    $(this).toggle();
      	    	});
      	    	oInit = '#o' + i
      	    	$(oInit).hide()
      	    	$(oInit).click(function() {
      	    	    $(this).toggle();
      	    	});
      	    }
            

      	    
        },
        
        
        // this is triggered by $(MyApp).trigger('selfJoined')
        // in sail.js after the user joins the groupchat (after 'connected')
        selfJoined: function(ev) {
            // example of how to trigger a sail event
            // note that this will be handled by event.sail.here (further up in this file)
            sev = new Sail.Event('here', {who: ticTacToe.session.account.login})
            ticTacToe.groupchat.sendEvent(sev)
        },
        
        
        // this would be triggered by $(MyApp).trigger('anotherLocalEvent')
        anotherLocalEvent: function(ev) {
            
        },

        // sail event mapped to local event -- see the explenation above for "foo: 'foobar'".
        // `ev` is a standard javascript event object (for the most part you can probably just
        // ignore this, as it doesn't contain much useful data); `sev` is the sail event object,
        // with the typical sail event fiels like `sev.eventType` and `sev.payload`.
        foobar: function(ev, sev) {
            
        },
        
        // triggered in MyApp.unauthenticate once the user has been unauthenticated
        unauthenticated: function(ev) {
            document.location.reload()
        },
    }
}
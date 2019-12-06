const { BotkitConversation } = require('botkit');
const connFactory = require('../util/connection-factory');

module.exports = controller => {
    let convo = new BotkitConversation('sf_auth', controller);

    convo.addMessage({
        text: `Ok, You are still connected to your old Salesforce instance.`,
        action: 'complete'
    }, 'no_thread');

    convo.addMessage({
        text: `Sorry, I didn't understand that. Please provide a yes or no response.`,
        action: 'default'
    }, 'bad_response');

    convo.addMessage({
        text: `click this link to connect\n<{{vars.authUrl}}|Connect to Salesforce>`,
        action: 'default'
    }, 'connect');

    convo.addQuestion('You are already connected to a Salesforce instance. Are you sure you want to disconnect from it and connect to another instance?', [
        {
            pattern: '^(yes|yea|yup|yep|ya|sure|ok|y|yeah|yah)',
            handler: async function(response, convo, bot) {
                console.log('nlp response----');
                console.log(response);
                console.dir(bot.team.info());
                console.dir(bot.team.profile());
                console.dir(convo);
                const authUrl = connFactory.getAuthUrl(bot.team_id);
                convo.setVar('authUrl',authUrl);
                await convo.gotoThread('connect');
            }
        },
        {
            pattern: '^(no|nah|nope|n)',
            handler: async function(response, convo, bot) {
                console.log('nlp response----');
                console.log(response);
                await convo.gotoThread('no_thread');
            }
        },
        {
            default: true,
            handler: async function(response, convo, bot) {
                console.log('nlp response----');
                console.log(response);
                await convo.gotoThread('bad_response');
            }
        }
    ], 'reconnect', 'default');

    controller.addDialog(convo);
}

/* 

SlackBotWorker {
    2019-12-06T14:31:59.169706+00:00 app[web.1]:   _controller: Botkit {
    2019-12-06T14:31:59.169708+00:00 app[web.1]:     _events: {
    2019-12-06T14:31:59.169709+00:00 app[web.1]:       direct_message: [Array],
    2019-12-06T14:31:59.169711+00:00 app[web.1]:       oauth_success: [Array],
    2019-12-06T14:31:59.169713+00:00 app[web.1]:       onboard: [Array],
    2019-12-06T14:31:59.169714+00:00 app[web.1]:       create_channel: [Array],
    2019-12-06T14:31:59.169716+00:00 app[web.1]:       app_uninstalled: [Array],
    2019-12-06T14:31:59.169717+00:00 app[web.1]:       'post-message': [Array]
    2019-12-06T14:31:59.169719+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169721+00:00 app[web.1]:     _triggers: {},
    2019-12-06T14:31:59.169722+00:00 app[web.1]:     _interrupts: {},
    2019-12-06T14:31:59.169724+00:00 app[web.1]:     version: '4.5.0',
    2019-12-06T14:31:59.169725+00:00 app[web.1]:     middleware: {
    2019-12-06T14:31:59.169727+00:00 app[web.1]:       spawn: [Ware],
    2019-12-06T14:31:59.169728+00:00 app[web.1]:       ingest: [Ware],
    2019-12-06T14:31:59.169730+00:00 app[web.1]:       send: [Ware],
    2019-12-06T14:31:59.169731+00:00 app[web.1]:       receive: [Ware],
    2019-12-06T14:31:59.169733+00:00 app[web.1]:       interpret: [Ware]
    2019-12-06T14:31:59.169734+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169736+00:00 app[web.1]:     PATH: '/app/node_modules/botkit/lib',
    2019-12-06T14:31:59.169737+00:00 app[web.1]:     _config: {
    2019-12-06T14:31:59.169739+00:00 app[web.1]:       webhook_uri: '/slack/receive',
    2019-12-06T14:31:59.169740+00:00 app[web.1]:       dialogStateProperty: 'dialogState',
    2019-12-06T14:31:59.169742+00:00 app[web.1]:       disable_webserver: false,
    2019-12-06T14:31:59.169743+00:00 app[web.1]:       adapter: [SlackAdapter]
    2019-12-06T14:31:59.169744+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169746+00:00 app[web.1]:     _deps: { booted: true, webserver: true },
    2019-12-06T14:31:59.169747+00:00 app[web.1]:     _bootCompleteHandlers: [ [Function] ],
    2019-12-06T14:31:59.169749+00:00 app[web.1]:     booted: true,
    2019-12-06T14:31:59.169750+00:00 app[web.1]:     storage: MemoryStorage { memory: [Object], etag: 3 },
    2019-12-06T14:31:59.169752+00:00 app[web.1]:     conversationState: BotkitConversationState {
    2019-12-06T14:31:59.169753+00:00 app[web.1]:       storage: [MemoryStorage],
    2019-12-06T14:31:59.169768+00:00 app[web.1]:       storageKey: [Function],
    2019-12-06T14:31:59.169769+00:00 app[web.1]:       stateKey: Symbol(state),
    2019-12-06T14:31:59.169771+00:00 app[web.1]:       namespace: ''
    2019-12-06T14:31:59.169772+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169774+00:00 app[web.1]:     dialogSet: DialogSet {
    2019-12-06T14:31:59.169775+00:00 app[web.1]:       dialogs: [Object],
    2019-12-06T14:31:59.169784+00:00 app[web.1]:       dialogState: [BotStatePropertyAccessor]
    2019-12-06T14:31:59.169786+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169790+00:00 app[web.1]:     webserver: [Function: app] EventEmitter {
    2019-12-06T14:31:59.169791+00:00 app[web.1]:       _events: [Object: null prototype],
    2019-12-06T14:31:59.169793+00:00 app[web.1]:       _eventsCount: 1,
    2019-12-06T14:31:59.169794+00:00 app[web.1]:       _maxListeners: undefined,
    2019-12-06T14:31:59.169796+00:00 app[web.1]:       setMaxListeners: [Function: setMaxListeners],
    2019-12-06T14:31:59.169797+00:00 app[web.1]:       getMaxListeners: [Function: getMaxListeners],
    2019-12-06T14:31:59.169799+00:00 app[web.1]:       emit: [Function: emit],
    2019-12-06T14:31:59.169800+00:00 app[web.1]:       addListener: [Function: addListener],
    2019-12-06T14:31:59.169801+00:00 app[web.1]:       on: [Function: addListener],
    2019-12-06T14:31:59.169803+00:00 app[web.1]:       prependListener: [Function: prependListener],
    2019-12-06T14:31:59.169804+00:00 app[web.1]:       once: [Function: once],
    2019-12-06T14:31:59.169806+00:00 app[web.1]:       prependOnceListener: [Function: prependOnceListener],
    2019-12-06T14:31:59.169807+00:00 app[web.1]:       removeListener: [Function: removeListener],
    2019-12-06T14:31:59.169809+00:00 app[web.1]:       off: [Function: removeListener],
    2019-12-06T14:31:59.169810+00:00 app[web.1]:       removeAllListeners: [Function: removeAllListeners],
    2019-12-06T14:31:59.169812+00:00 app[web.1]:       listeners: [Function: listeners],
    2019-12-06T14:31:59.169813+00:00 app[web.1]:       rawListeners: [Function: rawListeners],
    2019-12-06T14:31:59.169815+00:00 app[web.1]:       listenerCount: [Function: listenerCount],
    2019-12-06T14:31:59.169816+00:00 app[web.1]:       eventNames: [Function: eventNames],
    2019-12-06T14:31:59.169817+00:00 app[web.1]:       init: [Function: init],
    2019-12-06T14:31:59.169819+00:00 app[web.1]:       defaultConfiguration: [Function: defaultConfiguration],
    2019-12-06T14:31:59.169820+00:00 app[web.1]:       lazyrouter: [Function: lazyrouter],
    2019-12-06T14:31:59.169821+00:00 app[web.1]:       handle: [Function: handle],
    2019-12-06T14:31:59.169823+00:00 app[web.1]:       use: [Function: use],
    2019-12-06T14:31:59.169824+00:00 app[web.1]:       route: [Function: route],
    2019-12-06T14:31:59.169826+00:00 app[web.1]:       engine: [Function: engine],
    2019-12-06T14:31:59.169827+00:00 app[web.1]:       param: [Function: param],
    2019-12-06T14:31:59.169829+00:00 app[web.1]:       set: [Function: set],
    2019-12-06T14:31:59.169830+00:00 app[web.1]:       path: [Function: path],
    2019-12-06T14:31:59.169831+00:00 app[web.1]:       enabled: [Function: enabled],
    2019-12-06T14:31:59.169833+00:00 app[web.1]:       disabled: [Function: disabled],
    2019-12-06T14:31:59.169834+00:00 app[web.1]:       enable: [Function: enable],
    2019-12-06T14:31:59.169836+00:00 app[web.1]:       disable: [Function: disable],
    2019-12-06T14:31:59.169837+00:00 app[web.1]:       acl: [Function],
    2019-12-06T14:31:59.169838+00:00 app[web.1]:       bind: [Function],
    2019-12-06T14:31:59.169840+00:00 app[web.1]:       checkout: [Function],
    2019-12-06T14:31:59.169841+00:00 app[web.1]:       connect: [Function],
    2019-12-06T14:31:59.169842+00:00 app[web.1]:       copy: [Function],
    2019-12-06T14:31:59.169844+00:00 app[web.1]:       delete: [Function],
    2019-12-06T14:31:59.169847+00:00 app[web.1]:       get: [Function],
    2019-12-06T14:31:59.169848+00:00 app[web.1]:       head: [Function],
    2019-12-06T14:31:59.169850+00:00 app[web.1]:       link: [Function],
    2019-12-06T14:31:59.169851+00:00 app[web.1]:       lock: [Function],
    2019-12-06T14:31:59.169853+00:00 app[web.1]:       'm-search': [Function],
    2019-12-06T14:31:59.169854+00:00 app[web.1]:       merge: [Function],
    2019-12-06T14:31:59.169855+00:00 app[web.1]:       mkactivity: [Function],
    2019-12-06T14:31:59.169857+00:00 app[web.1]:       mkcalendar: [Function],
    2019-12-06T14:31:59.169858+00:00 app[web.1]:       mkcol: [Function],
    2019-12-06T14:31:59.169860+00:00 app[web.1]:       move: [Function],
    2019-12-06T14:31:59.169861+00:00 app[web.1]:       notify: [Function],
    2019-12-06T14:31:59.169863+00:00 app[web.1]:       options: [Function],
    2019-12-06T14:31:59.169864+00:00 app[web.1]:       patch: [Function],
    2019-12-06T14:31:59.169866+00:00 app[web.1]:       post: [Function],
    2019-12-06T14:31:59.169867+00:00 app[web.1]:       propfind: [Function],
    2019-12-06T14:31:59.169869+00:00 app[web.1]:       proppatch: [Function],
    2019-12-06T14:31:59.169870+00:00 app[web.1]:       purge: [Function],
    2019-12-06T14:31:59.169872+00:00 app[web.1]:       put: [Function],
    2019-12-06T14:31:59.169873+00:00 app[web.1]:       rebind: [Function],
    2019-12-06T14:31:59.169875+00:00 app[web.1]:       report: [Function],
    2019-12-06T14:31:59.169876+00:00 app[web.1]:       search: [Function],
    2019-12-06T14:31:59.169878+00:00 app[web.1]:       source: [Function],
    2019-12-06T14:31:59.169879+00:00 app[web.1]:       subscribe: [Function],
    2019-12-06T14:31:59.169880+00:00 app[web.1]:       trace: [Function],
    2019-12-06T14:31:59.169882+00:00 app[web.1]:       unbind: [Function],
    2019-12-06T14:31:59.169883+00:00 app[web.1]:       unlink: [Function],
    2019-12-06T14:31:59.169885+00:00 app[web.1]:       unlock: [Function],
    2019-12-06T14:31:59.169886+00:00 app[web.1]:       unsubscribe: [Function],
    2019-12-06T14:31:59.169887+00:00 app[web.1]:       all: [Function: all],
    2019-12-06T14:31:59.169889+00:00 app[web.1]:       del: [Function],
    2019-12-06T14:31:59.169890+00:00 app[web.1]:       render: [Function],
    2019-12-06T14:31:59.169891+00:00 app[web.1]:       listen: [Function: listen],
    2019-12-06T14:31:59.169893+00:00 app[web.1]:       request: [IncomingMessage],
    2019-12-06T14:31:59.169894+00:00 app[web.1]:       response: [ServerResponse],
    2019-12-06T14:31:59.169895+00:00 app[web.1]:       cache: {},
    2019-12-06T14:31:59.169897+00:00 app[web.1]:       engines: {},
    2019-12-06T14:31:59.169898+00:00 app[web.1]:       settings: [Object],
    2019-12-06T14:31:59.169900+00:00 app[web.1]:       locals: [Object: null prototype],
    2019-12-06T14:31:59.169901+00:00 app[web.1]:       mountpath: '/',
    2019-12-06T14:31:59.169902+00:00 app[web.1]:       _router: [Function]
    2019-12-06T14:31:59.169904+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169905+00:00 app[web.1]:     http: Server {
    2019-12-06T14:31:59.169906+00:00 app[web.1]:       _events: [Object: null prototype],
    2019-12-06T14:31:59.169908+00:00 app[web.1]:       _eventsCount: 2,
    2019-12-06T14:31:59.169909+00:00 app[web.1]:       _maxListeners: undefined,
    2019-12-06T14:31:59.169910+00:00 app[web.1]:       _connections: 1,
    2019-12-06T14:31:59.169912+00:00 app[web.1]:       _handle: [TCP],
    2019-12-06T14:31:59.169913+00:00 app[web.1]:       _usingWorkers: false,
    2019-12-06T14:31:59.169914+00:00 app[web.1]:       _workers: [],
    2019-12-06T14:31:59.169916+00:00 app[web.1]:       _unref: false,
    2019-12-06T14:31:59.169917+00:00 app[web.1]:       allowHalfOpen: true,
    2019-12-06T14:31:59.169919+00:00 app[web.1]:       pauseOnConnect: false,
    2019-12-06T14:31:59.169920+00:00 app[web.1]:       httpAllowHalfOpen: false,
    2019-12-06T14:31:59.169921+00:00 app[web.1]:       timeout: 120000,
    2019-12-06T14:31:59.169923+00:00 app[web.1]:       keepAliveTimeout: 5000,
    2019-12-06T14:31:59.169924+00:00 app[web.1]:       maxHeadersCount: null,
    2019-12-06T14:31:59.169925+00:00 app[web.1]:       headersTimeout: 40000,
    2019-12-06T14:31:59.169927+00:00 app[web.1]:       _connectionKey: '6::::9972',
    2019-12-06T14:31:59.169932+00:00 app[web.1]:       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
    2019-12-06T14:31:59.169933+00:00 app[web.1]:       [Symbol(ServerResponse)]: [Function: ServerResponse],
    2019-12-06T14:31:59.169935+00:00 app[web.1]:       [Symbol(asyncId)]: 21
    2019-12-06T14:31:59.169936+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169938+00:00 app[web.1]:     adapter: SlackAdapter {
    2019-12-06T14:31:59.169939+00:00 app[web.1]:       middleware: [MiddlewareSet],
    2019-12-06T14:31:59.169940+00:00 app[web.1]:       name: 'Slack Adapter',
    2019-12-06T14:31:59.169942+00:00 app[web.1]:       botkit_worker: [Function: SlackBotWorker],
    2019-12-06T14:31:59.169943+00:00 app[web.1]:       options: [Object],
    2019-12-06T14:31:59.169945+00:00 app[web.1]:       middlewares: [Object]
    2019-12-06T14:31:59.169946+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169947+00:00 app[web.1]:     plugin_list: [ 'Slack Adapter' ],
    2019-12-06T14:31:59.169949+00:00 app[web.1]:     _plugins: { database: [Object] }
    2019-12-06T14:31:59.169950+00:00 app[web.1]:   },
    2019-12-06T14:31:59.169952+00:00 app[web.1]:   _config: {
    2019-12-06T14:31:59.169953+00:00 app[web.1]:     dialogContext: DialogContext {
    2019-12-06T14:31:59.169954+00:00 app[web.1]:       dialogs: [DialogSet],
    2019-12-06T14:31:59.169956+00:00 app[web.1]:       context: [TurnContext],
    2019-12-06T14:31:59.169957+00:00 app[web.1]:       stack: [Array]
    2019-12-06T14:31:59.169959+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169960+00:00 app[web.1]:     reference: {
    2019-12-06T14:31:59.169962+00:00 app[web.1]:       activityId: '1575642718.002900',
    2019-12-06T14:31:59.169963+00:00 app[web.1]:       user: [Object],
    2019-12-06T14:31:59.169964+00:00 app[web.1]:       bot: [Object],
    2019-12-06T14:31:59.169966+00:00 app[web.1]:       conversation: [Object],
    2019-12-06T14:31:59.169967+00:00 app[web.1]:       channelId: 'slack',
    2019-12-06T14:31:59.169968+00:00 app[web.1]:       serviceUrl: undefined
    2019-12-06T14:31:59.169970+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169971+00:00 app[web.1]:     context: TurnContext {
    2019-12-06T14:31:59.169973+00:00 app[web.1]:       _respondedRef: [Object],
    2019-12-06T14:31:59.169974+00:00 app[web.1]:       _turnState: [Map],
    2019-12-06T14:31:59.169976+00:00 app[web.1]:       _onSendActivities: [],
    2019-12-06T14:31:59.169978+00:00 app[web.1]:       _onUpdateActivity: [],
    2019-12-06T14:31:59.169979+00:00 app[web.1]:       _onDeleteActivity: [],
    2019-12-06T14:31:59.169981+00:00 app[web.1]:       _adapter: [SlackAdapter],
    2019-12-06T14:31:59.169983+00:00 app[web.1]:       _activity: [Object]
    2019-12-06T14:31:59.169984+00:00 app[web.1]:     },
    2019-12-06T14:31:59.169986+00:00 app[web.1]:     activity: {
    2019-12-06T14:31:59.169987+00:00 app[web.1]:       id: '1575642718.002900',
    2019-12-06T14:31:59.169989+00:00 app[web.1]:       timestamp: 2019-12-06T14:31:58.940Z,
    2019-12-06T14:31:59.169992+00:00 app[web.1]:       channelId: 'slack',
    2019-12-06T14:31:59.169994+00:00 app[web.1]:       conversation: [Object],
    2019-12-06T14:31:59.169995+00:00 app[web.1]:       from: [Object],
    2019-12-06T14:31:59.169997+00:00 app[web.1]:       recipient: [Object],
    2019-12-06T14:31:59.169998+00:00 app[web.1]:       channelData: [Object],
    2019-12-06T14:31:59.170000+00:00 app[web.1]:       text: 'yes',
    2019-12-06T14:31:59.170001+00:00 app[web.1]:       type: 'message'
    2019-12-06T14:31:59.170003+00:00 app[web.1]:     }
    2019-12-06T14:31:59.170004+00:00 app[web.1]:   },
    2019-12-06T14:31:59.170005+00:00 app[web.1]:   api: WebClient {
    2019-12-06T14:31:59.170007+00:00 app[web.1]:     _events: Events <[Object: null prototype] {}> {},
    2019-12-06T14:31:59.170008+00:00 app[web.1]:     _eventsCount: 0,
    2019-12-06T14:31:59.170010+00:00 app[web.1]:     isTokenRefreshing: false,
    2019-12-06T14:31:59.170011+00:00 app[web.1]:     api: { test: [Function: bound apiCall] },
    2019-12-06T14:31:59.170012+00:00 app[web.1]:     apps: { permissions: [Object] },
    2019-12-06T14:31:59.170014+00:00 app[web.1]:     auth: {
    2019-12-06T14:31:59.170015+00:00 app[web.1]:       revoke: [Function: bound apiCall],
    2019-12-06T14:31:59.170017+00:00 app[web.1]:       test: [Function: bound apiCall]
    2019-12-06T14:31:59.170018+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170019+00:00 app[web.1]:     bots: { info: [Function: bound apiCall] },
    2019-12-06T14:31:59.170021+00:00 app[web.1]:     channels: {
    2019-12-06T14:31:59.170022+00:00 app[web.1]:       archive: [Function: bound apiCall],
    2019-12-06T14:31:59.170023+00:00 app[web.1]:       create: [Function: bound apiCall],
    2019-12-06T14:31:59.170025+00:00 app[web.1]:       history: [Function: bound apiCall],
    2019-12-06T14:31:59.170026+00:00 app[web.1]:       info: [Function: bound apiCall],
    2019-12-06T14:31:59.170027+00:00 app[web.1]:       invite: [Function: bound apiCall],
    2019-12-06T14:31:59.170029+00:00 app[web.1]:       join: [Function: bound apiCall],
    2019-12-06T14:31:59.170030+00:00 app[web.1]:       kick: [Function: bound apiCall],
    2019-12-06T14:31:59.170032+00:00 app[web.1]:       leave: [Function: bound apiCall],
    2019-12-06T14:31:59.170033+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170035+00:00 app[web.1]:       mark: [Function: bound apiCall],
    2019-12-06T14:31:59.170036+00:00 app[web.1]:       rename: [Function: bound apiCall],
    2019-12-06T14:31:59.170037+00:00 app[web.1]:       replies: [Function: bound apiCall],
    2019-12-06T14:31:59.170039+00:00 app[web.1]:       setPurpose: [Function: bound apiCall],
    2019-12-06T14:31:59.170040+00:00 app[web.1]:       setTopic: [Function: bound apiCall],
    2019-12-06T14:31:59.170042+00:00 app[web.1]:       unarchive: [Function: bound apiCall]
    2019-12-06T14:31:59.170043+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170045+00:00 app[web.1]:     chat: {
    2019-12-06T14:31:59.170046+00:00 app[web.1]:       delete: [Function: bound apiCall],
    2019-12-06T14:31:59.170047+00:00 app[web.1]:       deleteScheduledMessage: [Function: bound apiCall],
    2019-12-06T14:31:59.170049+00:00 app[web.1]:       getPermalink: [Function: bound apiCall],
    2019-12-06T14:31:59.170050+00:00 app[web.1]:       meMessage: [Function: bound apiCall],
    2019-12-06T14:31:59.170052+00:00 app[web.1]:       postEphemeral: [Function: bound apiCall],
    2019-12-06T14:31:59.170053+00:00 app[web.1]:       postMessage: [Function: bound apiCall],
    2019-12-06T14:31:59.170054+00:00 app[web.1]:       scheduleMessage: [Function: bound apiCall],
    2019-12-06T14:31:59.170056+00:00 app[web.1]:       scheduledMessages: [Object],
    2019-12-06T14:31:59.170057+00:00 app[web.1]:       unfurl: [Function: bound apiCall],
    2019-12-06T14:31:59.170059+00:00 app[web.1]:       update: [Function: bound apiCall]
    2019-12-06T14:31:59.170060+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170061+00:00 app[web.1]:     conversations: {
    2019-12-06T14:31:59.170063+00:00 app[web.1]:       archive: [Function: bound apiCall],
    2019-12-06T14:31:59.170064+00:00 app[web.1]:       close: [Function: bound apiCall],
    2019-12-06T14:31:59.170065+00:00 app[web.1]:       create: [Function: bound apiCall],
    2019-12-06T14:31:59.170067+00:00 app[web.1]:       history: [Function: bound apiCall],
    2019-12-06T14:31:59.170068+00:00 app[web.1]:       info: [Function: bound apiCall],
    2019-12-06T14:31:59.170069+00:00 app[web.1]:       invite: [Function: bound apiCall],
    2019-12-06T14:31:59.170071+00:00 app[web.1]:       join: [Function: bound apiCall],
    2019-12-06T14:31:59.170072+00:00 app[web.1]:       kick: [Function: bound apiCall],
    2019-12-06T14:31:59.170073+00:00 app[web.1]:       leave: [Function: bound apiCall],
    2019-12-06T14:31:59.170075+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170076+00:00 app[web.1]:       members: [Function: bound apiCall],
    2019-12-06T14:31:59.170078+00:00 app[web.1]:       open: [Function: bound apiCall],
    2019-12-06T14:31:59.170079+00:00 app[web.1]:       rename: [Function: bound apiCall],
    2019-12-06T14:31:59.170080+00:00 app[web.1]:       replies: [Function: bound apiCall],
    2019-12-06T14:31:59.170082+00:00 app[web.1]:       setPurpose: [Function: bound apiCall],
    2019-12-06T14:31:59.170083+00:00 app[web.1]:       setTopic: [Function: bound apiCall],
    2019-12-06T14:31:59.170084+00:00 app[web.1]:       unarchive: [Function: bound apiCall]
    2019-12-06T14:31:59.170086+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170087+00:00 app[web.1]:     dialog: { open: [Function: bound apiCall] },
    2019-12-06T14:31:59.170089+00:00 app[web.1]:     dnd: {
    2019-12-06T14:31:59.170090+00:00 app[web.1]:       endDnd: [Function: bound apiCall],
    2019-12-06T14:31:59.170091+00:00 app[web.1]:       endSnooze: [Function: bound apiCall],
    2019-12-06T14:31:59.170093+00:00 app[web.1]:       info: [Function: bound apiCall],
    2019-12-06T14:31:59.170094+00:00 app[web.1]:       setSnooze: [Function: bound apiCall],
    2019-12-06T14:31:59.170096+00:00 app[web.1]:       teamInfo: [Function: bound apiCall]
    2019-12-06T14:31:59.170097+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170098+00:00 app[web.1]:     emoji: { list: [Function: bound apiCall] },
    2019-12-06T14:31:59.170100+00:00 app[web.1]:     files: {
    2019-12-06T14:31:59.170101+00:00 app[web.1]:       delete: [Function: bound apiCall],
    2019-12-06T14:31:59.170103+00:00 app[web.1]:       info: [Function: bound apiCall],
    2019-12-06T14:31:59.170104+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170106+00:00 app[web.1]:       revokePublicURL: [Function: bound apiCall],
    2019-12-06T14:31:59.170107+00:00 app[web.1]:       sharedPublicURL: [Function: bound apiCall],
    2019-12-06T14:31:59.170109+00:00 app[web.1]:       upload: [Function: bound apiCall],
    2019-12-06T14:31:59.170110+00:00 app[web.1]:       comments: [Object]
    2019-12-06T14:31:59.170112+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170116+00:00 app[web.1]:     groups: {
    2019-12-06T14:31:59.170118+00:00 app[web.1]:       archive: [Function: bound apiCall],
    2019-12-06T14:31:59.170131+00:00 app[web.1]:       create: [Function: bound apiCall],
    2019-12-06T14:31:59.170133+00:00 app[web.1]:       createChild: [Function: bound apiCall],
    2019-12-06T14:31:59.170135+00:00 app[web.1]:       history: [Function: bound apiCall],
    2019-12-06T14:31:59.170136+00:00 app[web.1]:       info: [Function: bound apiCall],
    2019-12-06T14:31:59.170137+00:00 app[web.1]:       invite: [Function: bound apiCall],
    2019-12-06T14:31:59.170139+00:00 app[web.1]:       kick: [Function: bound apiCall],
    2019-12-06T14:31:59.170140+00:00 app[web.1]:       leave: [Function: bound apiCall],
    2019-12-06T14:31:59.170142+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170143+00:00 app[web.1]:       mark: [Function: bound apiCall],
    2019-12-06T14:31:59.170145+00:00 app[web.1]:       open: [Function: bound apiCall],
    2019-12-06T14:31:59.170146+00:00 app[web.1]:       rename: [Function: bound apiCall],
    2019-12-06T14:31:59.170147+00:00 app[web.1]:       replies: [Function: bound apiCall],
    2019-12-06T14:31:59.170149+00:00 app[web.1]:       setPurpose: [Function: bound apiCall],
    2019-12-06T14:31:59.170150+00:00 app[web.1]:       setTopic: [Function: bound apiCall],
    2019-12-06T14:31:59.170152+00:00 app[web.1]:       unarchive: [Function: bound apiCall]
    2019-12-06T14:31:59.170153+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170154+00:00 app[web.1]:     im: {
    2019-12-06T14:31:59.170156+00:00 app[web.1]:       close: [Function: bound apiCall],
    2019-12-06T14:31:59.170157+00:00 app[web.1]:       history: [Function: bound apiCall],
    2019-12-06T14:31:59.170159+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170160+00:00 app[web.1]:       mark: [Function: bound apiCall],
    2019-12-06T14:31:59.170161+00:00 app[web.1]:       open: [Function: bound apiCall],
    2019-12-06T14:31:59.170163+00:00 app[web.1]:       replies: [Function: bound apiCall]
    2019-12-06T14:31:59.170164+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170165+00:00 app[web.1]:     migration: { exchange: [Function: bound apiCall] },
    2019-12-06T14:31:59.170167+00:00 app[web.1]:     mpim: {
    2019-12-06T14:31:59.170168+00:00 app[web.1]:       close: [Function: bound apiCall],
    2019-12-06T14:31:59.170170+00:00 app[web.1]:       history: [Function: bound apiCall],
    2019-12-06T14:31:59.170171+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170172+00:00 app[web.1]:       mark: [Function: bound apiCall],
    2019-12-06T14:31:59.170174+00:00 app[web.1]:       open: [Function: bound apiCall],
    2019-12-06T14:31:59.170175+00:00 app[web.1]:       replies: [Function: bound apiCall]
    2019-12-06T14:31:59.170176+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170178+00:00 app[web.1]:     oauth: {
    2019-12-06T14:31:59.170179+00:00 app[web.1]:       access: [Function: bound apiCall],
    2019-12-06T14:31:59.170181+00:00 app[web.1]:       token: [Function: bound apiCall]
    2019-12-06T14:31:59.170182+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170183+00:00 app[web.1]:     pins: {
    2019-12-06T14:31:59.170185+00:00 app[web.1]:       add: [Function: bound apiCall],
    2019-12-06T14:31:59.170186+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170188+00:00 app[web.1]:       remove: [Function: bound apiCall]
    2019-12-06T14:31:59.170189+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170190+00:00 app[web.1]:     reactions: {
    2019-12-06T14:31:59.170192+00:00 app[web.1]:       add: [Function: bound apiCall],
    2019-12-06T14:31:59.170193+00:00 app[web.1]:       get: [Function: bound apiCall],
    2019-12-06T14:31:59.170194+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170196+00:00 app[web.1]:       remove: [Function: bound apiCall]
    2019-12-06T14:31:59.170197+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170199+00:00 app[web.1]:     reminders: {
    2019-12-06T14:31:59.170200+00:00 app[web.1]:       add: [Function: bound apiCall],
    2019-12-06T14:31:59.170201+00:00 app[web.1]:       complete: [Function: bound apiCall],
    2019-12-06T14:31:59.170203+00:00 app[web.1]:       delete: [Function: bound apiCall],
    2019-12-06T14:31:59.170204+00:00 app[web.1]:       info: [Function: bound apiCall],
    2019-12-06T14:31:59.170205+00:00 app[web.1]:       list: [Function: bound apiCall]
    2019-12-06T14:31:59.170207+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170208+00:00 app[web.1]:     rtm: {
    2019-12-06T14:31:59.170209+00:00 app[web.1]:       connect: [Function: bound apiCall],
    2019-12-06T14:31:59.170211+00:00 app[web.1]:       start: [Function: bound apiCall]
    2019-12-06T14:31:59.170212+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170214+00:00 app[web.1]:     search: {
    2019-12-06T14:31:59.170215+00:00 app[web.1]:       all: [Function: bound apiCall],
    2019-12-06T14:31:59.170216+00:00 app[web.1]:       files: [Function: bound apiCall],
    2019-12-06T14:31:59.170218+00:00 app[web.1]:       messages: [Function: bound apiCall]
    2019-12-06T14:31:59.170219+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170220+00:00 app[web.1]:     stars: {
    2019-12-06T14:31:59.170222+00:00 app[web.1]:       add: [Function: bound apiCall],
    2019-12-06T14:31:59.170223+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170224+00:00 app[web.1]:       remove: [Function: bound apiCall]
    2019-12-06T14:31:59.170226+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170227+00:00 app[web.1]:     team: {
    2019-12-06T14:31:59.170228+00:00 app[web.1]:       accessLogs: [Function: bound apiCall],
    2019-12-06T14:31:59.170230+00:00 app[web.1]:       billableInfo: [Function: bound apiCall],
    2019-12-06T14:31:59.170231+00:00 app[web.1]:       info: [Function: bound apiCall],
    2019-12-06T14:31:59.170233+00:00 app[web.1]:       integrationLogs: [Function: bound apiCall],
    2019-12-06T14:31:59.170234+00:00 app[web.1]:       profile: [Object]
    2019-12-06T14:31:59.170236+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170237+00:00 app[web.1]:     usergroups: {
    2019-12-06T14:31:59.170239+00:00 app[web.1]:       create: [Function: bound apiCall],
    2019-12-06T14:31:59.170240+00:00 app[web.1]:       disable: [Function: bound apiCall],
    2019-12-06T14:31:59.170242+00:00 app[web.1]:       enable: [Function: bound apiCall],
    2019-12-06T14:31:59.170243+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170244+00:00 app[web.1]:       update: [Function: bound apiCall],
    2019-12-06T14:31:59.170246+00:00 app[web.1]:       users: [Object]
    2019-12-06T14:31:59.170247+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170249+00:00 app[web.1]:     users: {
    2019-12-06T14:31:59.170250+00:00 app[web.1]:       conversations: [Function: bound apiCall],
    2019-12-06T14:31:59.170252+00:00 app[web.1]:       deletePhoto: [Function: bound apiCall],
    2019-12-06T14:31:59.170253+00:00 app[web.1]:       getPresence: [Function: bound apiCall],
    2019-12-06T14:31:59.170254+00:00 app[web.1]:       identity: [Function: bound apiCall],
    2019-12-06T14:31:59.170256+00:00 app[web.1]:       info: [Function: bound apiCall],
    2019-12-06T14:31:59.170257+00:00 app[web.1]:       list: [Function: bound apiCall],
    2019-12-06T14:31:59.170259+00:00 app[web.1]:       lookupByEmail: [Function: bound apiCall],
    2019-12-06T14:31:59.170260+00:00 app[web.1]:       setActive: [Function: bound apiCall],
    2019-12-06T14:31:59.170261+00:00 app[web.1]:       setPhoto: [Function: bound apiCall],
    2019-12-06T14:31:59.170263+00:00 app[web.1]:       setPresence: [Function: bound apiCall],
    2019-12-06T14:31:59.170264+00:00 app[web.1]:       profile: [Object]
    2019-12-06T14:31:59.170265+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170267+00:00 app[web.1]:     _accessToken: 'xoxb-483103024786-507228297601-PkiijC7rrDi8TKD1zVwdVZiK',
    2019-12-06T14:31:59.170268+00:00 app[web.1]:     clientId: undefined,
    2019-12-06T14:31:59.170270+00:00 app[web.1]:     clientSecret: undefined,
    2019-12-06T14:31:59.170271+00:00 app[web.1]:     refreshToken: undefined,
    2019-12-06T14:31:59.170273+00:00 app[web.1]:     slackApiUrl: 'https://slack.com/api/',
    2019-12-06T14:31:59.170274+00:00 app[web.1]:     retryConfig: { forever: true, maxTimeout: 1800000, randomize: true },
    2019-12-06T14:31:59.170276+00:00 app[web.1]:     requestQueue: PQueue {
    2019-12-06T14:31:59.170277+00:00 app[web.1]:       queue: [PriorityQueue],
    2019-12-06T14:31:59.170279+00:00 app[web.1]:       _queueClass: [Function: PriorityQueue],
    2019-12-06T14:31:59.170280+00:00 app[web.1]:       _pendingCount: 0,
    2019-12-06T14:31:59.170282+00:00 app[web.1]:       _concurrency: 3,
    2019-12-06T14:31:59.170283+00:00 app[web.1]:       _isPaused: false,
    2019-12-06T14:31:59.170285+00:00 app[web.1]:       _resolveEmpty: [Function],
    2019-12-06T14:31:59.170286+00:00 app[web.1]:       _resolveIdle: [Function]
    2019-12-06T14:31:59.170287+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170289+00:00 app[web.1]:     tlsConfig: {},
    2019-12-06T14:31:59.170290+00:00 app[web.1]:     pageSize: 200,
    2019-12-06T14:31:59.170291+00:00 app[web.1]:     rejectRateLimitedCalls: false,
    2019-12-06T14:31:59.170293+00:00 app[web.1]:     logger: ConsoleLogger {
    2019-12-06T14:31:59.170294+00:00 app[web.1]:       level: 'info',
    2019-12-06T14:31:59.170296+00:00 app[web.1]:       name: '@slack/client:WebClient:5',
    2019-12-06T14:31:59.170297+00:00 app[web.1]:       debugFn: [Function: bound consoleCall]
    2019-12-06T14:31:59.170298+00:00 app[web.1]:     },
    2019-12-06T14:31:59.170300+00:00 app[web.1]:     axios: [Function: wrap] {
    2019-12-06T14:31:59.170301+00:00 app[web.1]:       request: [Function: wrap],
    2019-12-06T14:31:59.170302+00:00 app[web.1]:       delete: [Function: wrap],
    2019-12-06T14:31:59.170304+00:00 app[web.1]:       get: [Function: wrap],
    2019-12-06T14:31:59.170307+00:00 app[web.1]:       head: [Function: wrap],
    2019-12-06T14:31:59.170309+00:00 app[web.1]:       options: [Function: wrap],
    2019-12-06T14:31:59.170310+00:00 app[web.1]:       post: [Function: wrap],
    2019-12-06T14:31:59.170312+00:00 app[web.1]:       put: [Function: wrap],
    2019-12-06T14:31:59.170313+00:00 app[web.1]:       patch: [Function: wrap],
    2019-12-06T14:31:59.170314+00:00 app[web.1]:       defaults: [Object],
    2019-12-06T14:31:59.170316+00:00 app[web.1]:       interceptors: [Object]
    2019-12-06T14:31:59.170317+00:00 app[web.1]:     }
    2019-12-06T14:31:59.170319+00:00 app[web.1]:   }
    2019-12-06T14:31:59.170320+00:00 app[web.1]: } */
const path = require( 'path' );
const express = require( 'express' );
const compression = require( 'compression' );
const servePage = require( './servePage.js' );

const dev = !!process.env.DEV;

const app = express();

const root = path.resolve( __dirname, '..' );

app.use( compression({ threshold: 0 }) );

app.use( express.static( 'public/js', {
	maxAge: 60 * 1000 // one minute... we want to keep this short
}));

app.use( express.static( 'public/css', {
	maxAge: 60 * 1000
}));

app.use( express.static( 'public', {
	maxAge: 1000 * 60 * 60 * 24 // one day
}));

function loadComponent ( file ) {
	const resolved = require.resolve( `./${file}.js` );
	if ( dev ) delete require.cache[ resolved ];
	return require( resolved );
}

app.get( '/guide/', ( req, res ) => {
	res.redirect( 301, '/' );
});

app.get( '/guide', ( req, res ) => {
	res.redirect( 301, '/' );
});

app.get( '/repl', ( req, res ) => {
	const Nav = loadComponent( 'components/Nav' );
	const Repl = loadComponent( 'routes/Repl/index' );

	servePage( res, {
		title: 'rollup.js',
		lang: 'en',
		nav: Nav.render({ route: 'repl', lang: 'en' }),
		route: Repl.render() // TODO is there any point? just render an empty box instead?
	}).catch( err => {
		console.log( err.stack );
	});
});

app.get( '/:lang', ( req, res ) => {
	serveGuide( req, res, req.params.lang );
});

app.get( '/', ( req, res ) => {
	serveGuide( req, res, 'en' );
});

function serveGuide ( req, res, lang ) {
	const Nav = loadComponent( 'components/Nav' );
	const Guide = loadComponent( 'routes/Guide' );

	const sections = require( `${root}/public/guide/${lang}.json` );
	const summary = require( `${root}/public/guide-summary/${lang}.json` );

	servePage( res, {
		title: 'rollup.js',
		lang,
		nav: Nav.render({ route: 'guide', lang }),
		route: Guide.render({
			sections,
			summary,
			lang
		})
	}).catch( err => {
		console.log( err.stack );
	});
}

app.use( ( req, res, next ) => {
	if ( req.url.slice( -1 ) === '/' && req.url.length > 1 ) {
		res.redirect( 301, req.url.slice( 0, -1 ) );
	} else {
		next();
	}
});

app.listen( 3001, () => {
	console.log( 'listening on localhost:3001' );
});
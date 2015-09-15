(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ModuleAttribute = require('./../models/module-attribute.js');

/**
 * Shortcode Attributes collection.
 */
var ShortcodeAttributes = Backbone.Collection.extend({

	model : ModuleAttribute,

	// Deep Clone.
	clone: function() {
		return new this.constructor( _.map( this.models, function(m) {
			return m.clone();
		}));
	},

	/**
	 * Return only the data that needs to be saved.
	 *
	 * @return object
	 */
	toMicroJSON: function() {

		var json = {};

		this.each( function( model ) {
			json[ model.get( 'name' ) ] = model.toMicroJSON();
		} );

		return json;
	},


});

module.exports = ShortcodeAttributes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/module-attribute.js":5}],2:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Module   = require('./../models/module.js');

// Shortcode Collection
var Modules = Backbone.Collection.extend({

	model : Module,

	//  Deep Clone.
	clone : function() {
		return new this.constructor( _.map( this.models, function(m) {
			return m.clone();
		}));
	},

	/**
	 * Return only the data that needs to be saved.
	 *
	 * @return object
	 */
	toMicroJSON: function( options ) {
		return this.map( function(model) { return model.toMicroJSON( options ); } );
	},

});

module.exports = Modules;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/module.js":6}],3:[function(require,module,exports){
// Expose some functionality globally.
var globals = {
	Builder:       require('./models/builder.js'),
	BuilderView:   require('./views/builder.js'),
	ModuleFactory: require('./utils/module-factory.js'),
};

module.exports = globals;

},{"./models/builder.js":4,"./utils/module-factory.js":10,"./views/builder.js":11}],4:[function(require,module,exports){
(function (global){
var Backbone         = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Modules          = require('./../collections/modules.js');
var ModuleFactory    = require('./../utils/module-factory.js');
var availableModules = require('./../utils/available-modules.js');

var Builder = Backbone.Model.extend({

	defaults: {
		selectDefault:  usTwoPageBuilderData.l10n.selectDefault,
		addNewButton:   usTwoPageBuilderData.l10n.addNewButton,
		selection:      [], // Instance of Modules. Can't use a default, otherwise they won't be unique.
		allowedModules: [], // Module names allowed for this builder.
	},

	initialize: function() {

		// Set default selection to ensure it isn't a reference.
		if ( ! ( this.get('selection') instanceof Modules ) ) {
			this.set( 'selection', new Modules() );
		}

	},

	setData: function( data ) {

		var selection;

		if ( '' === data ) {
			return;
		}

		// Handle either JSON string or proper obhect.
		data = ( 'string' === typeof data ) ? JSON.parse( data ) : data;

		// Convert saved data to Module models.
		if ( data && Array.isArray( data ) ) {
			selection = data.map( function( module ) {
				return ModuleFactory.create( module.name, module.attr );
			} );
		}

		// Reset selection using data from hidden input.
		if ( selection && selection.length ) {
			this.get('selection').add( selection );
		}

	},

	saveData: function() {

		var data = [];

		this.get('selection').each( function( module ) {

			// Skip empty/broken modules.
			if ( ! module.get('name' ) ) {
				return;
			}

			data.push( module.toMicroJSON() );

		} );

		this.trigger( 'save', data );

	},

	/**
	 * List all available modules for this builder.
	 * All modules, filtered by this.allowedModules.
	 */
	getAvailableModules: function() {
		return _.filter( availableModules, function( module ) {
			return this.isModuleAllowed( module.name );
		}.bind( this ) );
	},

	isModuleAllowed: function( moduleName ) {
		return this.get('allowedModules').indexOf( moduleName ) >= 0;
	}

});

module.exports = Builder;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/modules.js":2,"./../utils/available-modules.js":8,"./../utils/module-factory.js":10}],5:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);

var ModuleAttribute = Backbone.Model.extend({

	defaults: {
		name:         '',
		label:        '',
		value:        '',
		type:         'text',
		description:  '',
		defaultValue: '',
		config:       {}
	},

	/**
	 * Return only the data that needs to be saved.
	 *
	 * @return object
	 */
	toMicroJSON: function() {

		var r = {};
		var allowedAttrProperties = [ 'name', 'value', 'type' ];

		_.each( allowedAttrProperties, function( prop ) {
			r[ prop ] = this.get( prop );
		}.bind(this) );

		return r;

	}

});

module.exports = ModuleAttribute;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
(function (global){
var Backbone   = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ModuleAtts = require('./../collections/module-attributes.js');

var Module = Backbone.Model.extend({

	defaults: {
		name:  '',
		label: '',
		attr:  [],
	},

	initialize: function() {

		// Set default selection to ensure it isn't a reference.
		if ( ! ( this.get('attr') instanceof ModuleAtts ) ) {
			this.set( 'attr', new ModuleAtts() );
		}

	},

	/**
	 * Get an attribute model by name.
	 */
	getAttr: function( attrName ) {
		return this.get('attr').findWhere( { name: attrName });
	},

	/**
	 * Custom Parse.
	 * Ensures attributes is an instance of ModuleAtts
	 */
	parse: function( response ) {

		if ( 'attr' in response && ! ( response.attr instanceof ModuleAtts ) ) {
			response.attr = new ModuleAtts( response.attr );
		}

	    return response;

	},

	toJSON: function() {

		var json = _.clone( this.attributes );

		if ( 'attr' in json && ( json.attr instanceof ModuleAtts ) ) {
			json.attr = json.attr.toJSON();
		}

		return json;

	},

	/**
	 * Return only the data that needs to be saved.
	 *
	 * @return object
	 */
	toMicroJSON: function() {
		return {
			name: this.get('name'),
			attr: this.get('attr').toMicroJSON()
		};
	},

});

module.exports = Module;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/module-attributes.js":1}],7:[function(require,module,exports){
(function (global){
var $             = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Builder       = require('./models/builder.js');
var BuilderView   = require('./views/builder.js');

// Expose some functionality to global namespace.
window.ustwoPageBuilder = require('./globals');

$(document).ready(function(){

	// A field for storing the builder data.
	var $field = $( '[name=ustwo-page-builder-data]' );

	if ( ! $field.length ) {
		return;
	}

	// A container element for displaying the builder.
	var $container = $( '#ustwo-page-builder' );

	// Create a new instance of Builder model.
	// Pass an array of module names that are allowed for this builder.
	var builder = new Builder({
		allowedModules: $( '[name=ustwo-page-builder-allowed-modules]' ).val().split(',')
	});

	// Set the data using the current field value
	builder.setData( JSON.parse( $field.val() ) );

	// On save, update the field value.
	builder.on( 'save', function( data ) {
		$field.val( JSON.stringify( data ) );
	} );

	// Create builder view.
	var builderView = new BuilderView( { model: builder } );

	// Render builder.
	builderView.render().$el.appendTo( $container );

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./globals":3,"./models/builder.js":4,"./views/builder.js":11}],8:[function(require,module,exports){
/**
 * Available Modules.
 *
 * All available modules must be registered by ading them to the array of availableModules.
 * All default model data must be defined here.
 * Only the 'value' of each attribute is saved.
 */
var availableModules = [];

availableModules.push({
	label: 'Header',
	name:  'header',
	attr: [
		{ name: 'heading',    label: 'Heading',               type: 'text' },
		{ name: 'subheading', label: 'Subheading (optional)', type: 'textarea' },
	]
});

availableModules.push({
	label: 'Text',
	name:  'text',
	attr: [
		{ name: 'heading', label: 'Heading', type: 'text' },
		{ name: 'body',    label: 'Content', type: 'wysiwyg' },
	]
});

availableModules.push({
	name:  'stats',
	label: 'Stats/Figures',
	attr: [
		{ name: 'title', label: 'Title',    type: 'text' },
		{ name: 'col1',  label: 'Column 1', type: 'textarea' },
		{ name: 'col2',  label: 'Column 2', type: 'textarea' },
		{ name: 'col3',  label: 'Column 3', type: 'textarea' },
	]
});

availableModules.push({
	name:  'video',
	label: 'Video',
	attr: [
		{ name: 'video_id', label: 'Vimeo Video ID', type: 'text' },
	]
});

availableModules.push({
	label: 'Image',
	name: 'image',
	attr: [
		{ name: 'image',   label: 'Image',   type: 'image', config: { multiple: false, sizeReq: { width: 1024, height: 768 } } },
		{ name: 'caption', label: 'Caption', type: 'image' },
	]
});

availableModules.push({
	name: 'blockquote',
	label: 'Large Quote',
	attr: [
		{ name: 'text',     label: 'Quote Text',  type: 'textarea' },
		{ name: 'source',   label: 'Source',      type: 'text' },
	]
} );

availableModules.push({
	label: 'Case Studies',
	name:  'case_studies',
	attr: [
		{ name: 'case_studies', label: 'Case Studies', type: 'postID' },
	]
});

availableModules.push({
	label: 'Content Grid',
	name:  'grid',
	attr: [
		{ name: 'grid_cells', label: 'Grid Cells', type: 'builder' },
		{ name: 'grid_video', label: 'Video', type: 'video' },
		{ name: 'grid_image', label: 'Image', type: 'image' },
	]
});

availableModules.push({
	label: 'Text/Image Cell',
	name:  'grid_cell',
	attr: [
		{ name: 'heading', label: 'Heading', type: 'text' },
		{ name: 'body',    label: 'Content', type: 'wysiwyg' },
		{ name: 'image',   label: 'Image',   type: 'image', config: { sizeReq: { width: 640, height: 480 } } },
	]
});

availableModules.push({
	label: 'Image with logo and heading',
	name:  'image_logo_headline',
	attr: [
		{ name: 'heading', label: 'Heading', type: 'text' },
		{ name: 'image',   label: 'Image',   type: 'image', config: { sizeReq: { width: 1024, height: 768 } } },
	]
});

module.exports = availableModules;

},{}],9:[function(require,module,exports){
/**
 * Map module type to views.
 */
var editViewMap = {
	'header':              require('./../views/module-edit-header.js'),
	'textarea':            require('./../views/module-edit-textarea.js'),
	'text':                require('./../views/module-edit-text.js'),
	'stats':               require('./../views/module-edit-stats.js'),
	'image':               require('./../views/module-edit-image.js'),
	'video':               require('./../views/module-edit-video.js'),
	'blockquote':          require('./../views/module-edit-blockquote.js'),
	'case_studies':        require('./../views/module-edit-case-studies.js'),
	'grid':                require('./../views/module-edit-grid.js'),
	'grid_cell':           require('./../views/module-edit-grid-cell.js'),
	'image_logo_headline': require('./../views/module-edit-image-logo-headline.js'),
};

module.exports = editViewMap;

},{"./../views/module-edit-blockquote.js":13,"./../views/module-edit-case-studies.js":14,"./../views/module-edit-grid-cell.js":15,"./../views/module-edit-grid.js":16,"./../views/module-edit-header.js":17,"./../views/module-edit-image-logo-headline.js":18,"./../views/module-edit-image.js":19,"./../views/module-edit-stats.js":20,"./../views/module-edit-text.js":21,"./../views/module-edit-textarea.js":22,"./../views/module-edit-video.js":23}],10:[function(require,module,exports){
(function (global){
var availableModules = require('./available-modules.js');
var Module           = require('./../models/module.js');
var ModuleAtts       = require('./../collections/module-attributes.js');
var $                = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var ModuleFactory = {

	/**
	 * Create Module Model.
	 * Use data from config, plus saved data.
	 *
	 * @param  string moduleName
	 * @param  object attribute JSON. Saved attribute values.
	 * @return Module
	 */
	create: function( moduleName, attrData ) {

		var data = $.extend( true, {}, _.findWhere( availableModules, { name: moduleName } ) );

		if ( ! data ) {
			return null;
		}

		var attributes = new ModuleAtts();

		/**
		 * Add all the module attributes.
		 * Whitelisted to attributes documented in schema
		 * Sets only value from attrData.
		 */
		_.each( data.attr, function( attr ) {

			var cloneAttr = $.extend( true, {}, attr  );
			var savedAttr = _.findWhere( attrData, { name: attr.name } );

			// Add saved attribute values.
			if ( savedAttr && 'value' in savedAttr ) {
				cloneAttr.value = savedAttr.value;
			}

			attributes.add( cloneAttr );

		} );

		data.attr = attributes;

	    return new Module( data );

	},

};

module.exports = ModuleFactory;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../collections/module-attributes.js":1,"./../models/module.js":6,"./available-modules.js":8}],11:[function(require,module,exports){
(function (global){
var Backbone      = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Builder       = require('./../models/builder.js');
var editViewMap   = require('./../utils/edit-view-map.js');
var ModuleFactory = require('./../utils/module-factory.js');
var $             = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var Builder = Backbone.View.extend({

	template: $('#tmpl-ustwo-builder' ).html(),
	className: 'ustwo-page-builder',
	model: null,
	newModuleName: null,

	events: {
		'change > .add-new .add-new-module-select': 'toggleButtonStatus',
		'click > .add-new .add-new-module-button': 'addModule',
	},

	initialize: function() {

		var selection = this.model.get('selection');

		selection.on( 'add', this.addNewSelectionItemView, this );
		selection.on( 'all', this.model.saveData, this.model );

	},

	render: function() {

		var data = this.model.toJSON();

		this.$el.html( _.template( this.template, data  ) );

		this.model.get('selection').each( function( module ) {
			this.addNewSelectionItemView( module );
		}.bind( this ) );

		this.renderAddNew();
		this.initSortable();

		return this;

	},

	/**
	 * Render the Add New module controls.
	 */
	renderAddNew: function() {

		var $select = this.$el.find( '> .add-new select.add-new-module-select' );

		$select.append(
			$( '<option/>', { text: usTwoPageBuilderData.l10n.selectDefault } )
		);

		_.each( this.model.getAvailableModules(), function( module ) {
			var template = '<option value="<%= name %>"><%= label %></option>';
			$select.append( _.template( template, module ) );
		} );

	},

	/**
	 * Initialize Sortable.
	 */
	initSortable: function() {
		$( '> .selection', this.$el ).sortable({
			handle: '.module-edit-tools',
			items: '> .module-edit',
			stop: this.updateSelectionOrder.bind( this ),
		});
	},

	/**
	 * Sortable end callback.
	 * After reordering, update the selection order.
	 * Note - uses direct manipulation of collection models property.
	 * This is to avoid having to mess about with the views themselves.
	 */
	updateSelectionOrder: function( e, ui ) {

		var selection = this.model.get('selection');
		var item      = selection.get({ cid: ui.item.attr( 'data-cid') });
		var newIndex  = ui.item.index();
		var oldIndex  = selection.indexOf( item );

		if ( newIndex !== oldIndex ) {
			var dropped = selection.models.splice( oldIndex, 1 );
			selection.models.splice( newIndex, 0, dropped[0] );
			this.model.saveData();
		}

	},

	/**
	 * Toggle button status.
	 * Enable/Disable button depending on whether
	 * placeholder or valid module is selected.
	 */
	toggleButtonStatus: function(e) {
		var value         = $(e.target).val();
		var defaultOption = $(e.target).children().first().attr('value');
		$('.add-new-module-button', this.$el ).attr( 'disabled', value === defaultOption );
		this.newModuleName = ( value !== defaultOption ) ? value : null;
	},

	/**
	 * Handle adding module.
	 *
	 * Find module model. Clone it. Add to selection.
	 */
	addModule: function(e) {

		e.preventDefault();

		if ( this.newModuleName && this.model.isModuleAllowed( this.newModuleName ) ) {
			var model = ModuleFactory.create( this.newModuleName );
			this.model.get('selection').add( model );
		}

	},

	/**
	 * Append new selection item view.
	 */
	addNewSelectionItemView: function( item ) {

		var editView, view;

		editView = ( item.get('name') in editViewMap ) ? editViewMap[ item.get('name') ] : null;

		if ( ! editView || ! this.model.isModuleAllowed( item.get('name') ) ) {
			return;
		}

		view = new editView( { model: item } );

		$( '> .selection', this.$el ).append( view.render().$el );

		var $selection = $( '> .selection', this.$el );
		if ( $selection.hasClass('ui-sortable') ) {
			$selection.sortable('refresh');
		}


	},

});

module.exports = Builder;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/builder.js":4,"./../utils/edit-view-map.js":9,"./../utils/module-factory.js":10}],12:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Image Field
 *
 * Initialize and listen for the 'change' event to get updated data.
 *
 */
var FieldImage = Backbone.View.extend({

	template:  $( '#tmpl-ustwo-field-image' ).html(),
	frame:     null,
	imageAttr: null,
	config:    {},
	value:     [], // Attachment IDs.
	selection: {}, // Attachments collection for this.value.

	events: {
		'click .image-placeholder .button.add': 'editImage',
		'click .image-placeholder img': 'editImage',
		'click .image-placeholder .button.remove': 'removeImage',
	},

	/**
	 * Initialize.
	 *
	 * Pass value and config as properties on the options object.
	 * Available options
	 * - multiple: bool
	 * - sizeReq: eg { width: 100, height: 100 }
	 *
	 * @param  object options
	 * @return null
	 */
	initialize: function( options ) {

		_.bindAll( this, 'render', 'editImage', 'onSelectImage', 'removeImage', 'isAttachmentSizeOk' );

		if ( 'value' in options ) {
			this.value = options.value;
		}

		// Ensure value is array.
		if ( ! this.value || ! Array.isArray( this.value ) ) {
			this.value = [];
		}

		if ( 'config' in options ) {
			this.config = _.extend( {
				multiple: false,
			}, options.config );
		}

		this.on( 'change', this.render );

		this.initSelection();

	},

	/**
	 * Initialize Selection.
	 *
	 * Selection is an Attachment collection containing full models for the current value.
	 *
	 * @return null
	 */
	initSelection: function() {

		this.selection = new wp.media.model.Attachments();

		// Initialize selection.
		_.each( this.value, function( item ) {

			var model;

			// Legacy. Handle storing full objects.
			item  = ( 'object' === typeof( item ) ) ? item.id : item;
			model = new wp.media.attachment( item );

			this.selection.add( model );

			// Re-render after attachments have synced.
			model.fetch();
			model.on( 'sync', this.render );

		}.bind(this) );

	},

	render: function() {

		var template;

		template = _.memoize( function( value, config ) {
			return _.template( this.template, {
				value: value,
				config: config,
			} );
		}.bind(this) );

		this.$el.html( template( this.selection.toJSON(), this.config ) );

		return this;

	},

	onSelectImage: function() {

		var frame = this.frame || null;

		if ( ! frame ) {
			return;
		}

		this.value = [];
		this.selection.reset([]);

		frame.state().get('selection').each( function( attachment ) {

			if ( this.isAttachmentSizeOk( attachment ) ) {
				this.value.push( attachment.get('id') );
				this.selection.add( attachment );
			}

		}.bind(this) );

		this.trigger( 'change', this.value );

		frame.close();

	},

	editImage: function(e) {

		e.preventDefault();

		var frame = this.frame;

		if ( ! frame ) {

			var frameArgs = {
				library: { type: 'image' },
				multiple: this.config.multiple,
				title: 'Select Image',
				frame: 'select',
			};

			frame = this.frame = wp.media( frameArgs );

			frame.on( 'content:create:browse', this.setupFilters, this );
			frame.on( 'select', this.onSelectImage, this );

		}

		// When the frame opens, set the selection.
		frame.on( 'open', function() {

			var selection = frame.state().get('selection');

			// Set the selection.
			// Note - expects array of objects, not a collection.
			selection.set( this.selection.models );

		}.bind(this) );

		frame.open();

	},

	/**
	 * Add a filter to the frame library collection to limit to required size.
	 * @return null
	 */
	setupFilters: function() {

		var lib    = this.frame.state().get('library');

		if ( 'sizeReq' in this.config ) {
			lib.filters.size = this.isAttachmentSizeOk;
		}

	},

	removeImage: function(e) {

		e.preventDefault();

		var $target, id;

		$target   = $(e.target);
		$target   = ( $target.prop('tagName') === 'BUTTON' ) ? $target : $target.closest('button.remove');
		id        = $target.data( 'image-id' );

		if ( ! id  ) {
			return;
		}

		this.value = _.filter( this.value, function( val ) {
			return ( val !== id );
		} );

		this.value = ( this.value.length > 0 ) ? this.value : [];

		// Update selection.
		var remove = this.selection.filter( function( item ) {
			return this.value.indexOf( item.get('id') ) < 0;
		}.bind(this) );

		this.selection.remove( remove );

		this.trigger( 'change', this.value );

	},

	/**
	 * Does attachment meet size requirements?
	 *
	 * @param  Attachment
	 * @return boolean
	 */
	isAttachmentSizeOk: function( attachment ) {

		if ( ! ( 'sizeReq' in this.config ) ) {
			return true;
		}

		this.config.sizeReq = _.extend( {
			width: 0,
			height: 0,
		}, this.config.sizeReq );

		var widthReq  = attachment.get('width')  >= this.config.sizeReq.width;
		var heightReq = attachment.get('height') >= this.config.sizeReq.height;

		return widthReq && heightReq;

	}

} );

module.exports = FieldImage;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],13:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-blockquote' ).html(),
});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],14:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-case-studies' ).html(),
	caseStudyAttr: null,

	initialize: function() {
		ModuleEdit.prototype.initialize.apply( this );
		this.caseStudyAttr = this.model.get('attr').findWhere( { name: 'case_studies' });
	},

	render: function () {
		ModuleEdit.prototype.render.apply( this );
		this.initSelect2();
		return this;
	},

	initSelect2: function() {

		var $field = $( '[data-module-attr-name=case_studies]', this.$el );
		var values = this.caseStudyAttr.get('value');

		$.ajax( '/wp-json/ustwo/v1/case-studies/').done( function( data ) {

			data = _.map( data, function( item ) {
				return { id: item.slug, text: item.name };
			});

			$field.select2( {
				allowClear: true,
				data: data,
				multiple: true,
			} ).select2( 'val', values.split( ',' ) );

		} );

	},

	removeModel: function(e) {
		ModuleEdit.prototype.removeModel.apply( this, [e] );
	},

});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],15:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldImage = require('./field-image.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var GridCellModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-grid-cell' ).html(),
	imageField: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		var imageAttr = this.model.getAttr('image');

		this.imageField = new FieldImage( {
			value: imageAttr.get('value'),
			config: imageAttr.get('config') || {},
		} );

		this.imageField.on( 'change', function( data ) {
			imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function () {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.imageField.render().$el
		);

		return this;

	},

});

module.exports = GridCellModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-image.js":12,"./module-edit.js":24}],16:[function(require,module,exports){
(function (global){
var $           = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit  = require('./module-edit.js');
var Builder     = require('./../models/builder.js');
var FieldImage  = require('./field-image.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var GridModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-grid' ).html(),

	imageField: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		var imageAttr = this.model.getAttr('grid_image');

		this.imageField = new FieldImage( {
			value:  imageAttr.get('value'),
			config: imageAttr.get('config') || {},
		} );

		this.imageField.on( 'change', function( data ) {
			imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function() {

		this.model.set( 'cid', this.model.cid );
		ModuleEdit.prototype.render.apply( this );

		this.renderBuilder();
		this.renderImage();

		return this;

	},

	renderBuilder: function() {

		var builder = new Builder({
			id: 'grid-builder-' + this.model.cid,
			allowedModules: [ 'grid_cell' ],
		});

		// Require BuilderView. Note - do it after runtime to avoid loop.
		var BuilderView = require('./builder.js');
		var builderView = new BuilderView( { model: builder } );

		$( '.builder', this.$el ).append( builderView.render().$el );

		// On save, update attribute with builder data.
		// Manually trigger change event.
		builder.on( 'save', function( data ) {
			this.model.getAttr( 'grid_cells' ).set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

		// Initalize data.
		var attrModel = this.model.getAttr( 'grid_cells' );

		if ( attrModel ) {
			builder.setData( attrModel.get( 'value') );
		}

	},

	renderImage: function() {

		$( '> .selection-item > .form-row > .image-field', this.$el ).append(
			this.imageField.render().$el
		);

	},

});

module.exports = GridModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/builder.js":4,"./builder.js":11,"./field-image.js":12,"./module-edit.js":24}],17:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var HeaderModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-header' ).html(),
});

module.exports = HeaderModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],18:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldImage = require('./field-image.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var ImageModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-image-logo-headline' ).html(),
	imageField: null,
	imageAttr: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.imageAttr = this.model.getAttr('image');

		var config = this.imageAttr.get('config') || {};

		config = _.extend( {
			multiple: false,
		}, config );

		this.imageField = new FieldImage( {
			value: this.imageAttr.get('value'),
			config: config,
		} );

		this.imageField.on( 'change', function( data ) {
			this.imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function() {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.imageField.render().$el
		);

		return this;

	},

});

module.exports = ImageModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-image.js":12,"./module-edit.js":24}],19:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');
var FieldImage = require('./field-image.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var ImageModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-image' ).html(),
	imageField: null,
	imageAttr: null,

	initialize: function( attributes, options ) {

		ModuleEdit.prototype.initialize.apply( this, [ attributes, options ] );

		this.imageAttr = this.model.getAttr('image');

		var config = this.imageAttr.get('config') || {};

		config = _.extend( {
			multiple: false,
		}, config );

		this.imageField = new FieldImage( {
			value: this.imageAttr.get('value'),
			config: config,
		} );

		this.imageField.on( 'change', function( data ) {
			this.imageAttr.set( 'value', data );
			this.model.trigger( 'change', this.model );
		}.bind(this) );

	},

	render: function() {

		ModuleEdit.prototype.render.apply( this );

		$( '.image-field', this.$el ).append(
			this.imageField.render().$el
		);

		return this;

	},

});

module.exports = ImageModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./field-image.js":12,"./module-edit.js":24}],20:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var StatsModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-stats' ).html(),
});

module.exports = StatsModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],21:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({

	template: $( '#tmpl-ustwo-module-edit-text' ).html(),

	initialize: function() {

		ModuleEdit.prototype.initialize.apply( this );

		// Make sure the template for this module is unique to this instance.
		this.editor = {
			id           : 'ustwo-text-body-' + this.model.cid,
			nameRegex    : new RegExp( 'ustwo-placeholder-name', 'g' ),
			idRegex      : new RegExp( 'ustwo-placeholder-id', 'g' ),
			contentRegex : new RegExp( 'ustwo-placeholder-content', 'g' ),
		};

		this.template  = this.template.replace( this.editor.nameRegex, this.editor.id );
		this.template  = this.template.replace( this.editor.idRegex, this.editor.id );
		this.template  = this.template.replace( this.editor.contentRegex, '<%= attr.body.value %>' );

		this.test = this.model.cid;
	},

	render: function () {

		ModuleEdit.prototype.render.apply( this );

		// Prevent FOUC. Show again on init. See setup.
		$( '.wp-editor-wrap', this.$el ).css( 'display', 'none' );

		window.setTimeout( function() {
			this.initTinyMCE();
		}.bind( this ), 100 );

		return this;

	},

	/**
	 * Initialize the TinyMCE editor.
	 *
	 * @return null.
	 */
	initTinyMCE: function() {

		var self = this, id, ed, $el, prop;

		id  = this.editor.id;
		ed  = tinyMCE.get( id );
		$el = $( '#wp-' + id + '-wrap', this.$el );

		if ( ed ) {
			return;
		}

		// If no settings for this field. Clone from placeholder.
		if ( typeof( tinyMCEPreInit.mceInit[ id ] ) === 'undefined' ) {
			var newSettings = jQuery.extend( {}, tinyMCEPreInit.mceInit[ 'ustwo-placeholder-id' ] );
			for ( prop in newSettings ) {
				if ( 'string' === typeof( newSettings[prop] ) ) {
					newSettings[prop] = newSettings[prop].replace( this.editor.idRegex, id ).replace( this.editor.nameRegex, name );
				}
			}
			tinyMCEPreInit.mceInit[ id ] = newSettings;
		}

		// Remove fullscreen plugin.
		tinyMCEPreInit.mceInit[ id ].plugins = tinyMCEPreInit.mceInit[ id ].plugins.replace( 'fullscreen,', '' );

		// If no Quicktag settings for this field. Clone from placeholder.
		if ( typeof( tinyMCEPreInit.qtInit[ id ] ) === 'undefined' ) {
			var newQTS = jQuery.extend( {}, tinyMCEPreInit.qtInit[ 'ustwo-placeholder-id' ] );
			for ( prop in newQTS ) {
				if ( 'string' === typeof( newQTS[prop] ) ) {
					newQTS[prop] = newQTS[prop].replace( this.editor.idRegex, id ).replace( this.editor.nameRegex, name );
				}
			}
			tinyMCEPreInit.qtInit[ id ] = newQTS;
		}

		var mode = $el.hasClass('tmce-active') ? 'tmce' : 'html';

		// When editor inits, attach save callback to change event.
		tinyMCEPreInit.mceInit[id].setup = function() {

			this.on('change', function(e) {
				self.setAttr( 'body', e.target.getContent() );
			} );

			this.on( 'init', function() {
				window.setTimeout( function() {
					$el.css( 'display', 'block' );
				}, 100 );
			});

		};

		// If current mode is visual, create the tinyMCE.
		if ( 'tmce' === mode ) {
			tinyMCE.init( tinyMCEPreInit.mceInit[id] );
		} else {
			$el.css( 'display', 'block' );
		}

		// Init quicktags.
		setTimeout( function() {
			quicktags( tinyMCEPreInit.qtInit[ id ] );
			QTags._buttonsInit();
		}, 100 );

		// Handle temporarily remove tinyMCE when sorting.
		this.$el.closest('.ui-sortable').on( 'sortstart', function( event, ui ) {
			if ( ui.item[0].getAttribute('data-cid') === this.el.getAttribute('data-cid') ) {
				tinyMCE.execCommand( 'mceRemoveEditor', false, id );
			}
		}.bind(this) );

		// Handle re-init after sorting.
		this.$el.closest('.ui-sortable').on( 'sortstop', function( event, ui ) {
			if ( ui.item[0].getAttribute('data-cid') === this.el.getAttribute('data-cid') ) {
				tinyMCE.execCommand('mceAddEditor', false, id);
			}
		}.bind(this) );

	},

	/**
	 * Remove model handler.
	 */
	removeModel: function(e) {
		ModuleEdit.prototype.removeModel.apply( this, [e] );
		tinyMCE.execCommand( 'mceRemoveEditor', false, this.editor.id );
	},
});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],22:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Header Module.
 * Extends default moudule with custom different template.
 */
var HeaderModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-textarea' ).html(),
});

module.exports = HeaderModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],23:[function(require,module,exports){
(function (global){
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var ModuleEdit = require('./module-edit.js');

/**
 * Highlight Module.
 * Extends default moudule,
 * custom different template.
 */
var HighlightModuleEditView = ModuleEdit.extend({
	template: $( '#tmpl-ustwo-module-edit-video' ).html(),
});

module.exports = HighlightModuleEditView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./module-edit.js":24}],24:[function(require,module,exports){
(function (global){
var Backbone   = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var $          = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var ModuleEdit = Backbone.View.extend({

	className:     'module-edit',
	toolsTemplate: $('#tmpl-ustwo-module-edit-tools' ).html(),

	events: {
		'change *[data-module-attr-name]': 'attrFieldChanged',
		'keyup  *[data-module-attr-name]': 'attrFieldChanged',
		'input  *[data-module-attr-name]': 'attrFieldChanged',
		'click  .button-selection-item-remove': 'removeModel',
	},

	initialize: function() {
		_.bindAll( this, 'attrFieldChanged', 'removeModel', 'setAttr' );
	},

	render: function() {

		var data  = this.model.toJSON();
		data.attr = {};

		// Format attribute array for easy templating.
		// Because attributes in  array is difficult to access.
		this.model.get('attr').each( function( attr ) {
			data.attr[ attr.get('name') ] = attr.toJSON();
		} );

		this.$el.html( _.template( this.template, data ) );

		this.initializeColorpicker();

		// ID attribute, so we can connect the view and model again later.
		this.$el.attr( 'data-cid', this.model.cid );

		// Append the module tools.
		this.$el.prepend( _.template( this.toolsTemplate, data ) );

		return this;

	},

	initializeColorpicker: function() {
		$('.ustwo-pb-color-picker', this.$el ).wpColorPicker({
		    palettes: ['#ed0082', '#e60c29','#ff5519','#ffbf00','#96cc29','#14c04d','#16d5d9','#009cf3','#143fcc','#6114cc','#333333'],
			change: function( event, ui ) {
				$(this).attr( 'value', ui.color.toString() );
				$(this).trigger( 'change' );
			}
		});
	},

	setAttr: function( attribute, value ) {

		var attr = this.model.get( 'attr' ).findWhere( { name: attribute } );

		if ( attr ) {
			attr.set( 'value', value );
			this.model.trigger('change:attr');
		}

	},

	/**
	 * Change event handler.
	 * Update attribute following value change.
	 */
	attrFieldChanged: function(e) {

		var attr = e.target.getAttribute( 'data-module-attr-name' );

        if ( e.target.hasAttribute( 'contenteditable' ) ) {
        	this.setAttr( attr, $(e.target).html() );
        } else {
        	this.setAttr( attr, e.target.value );
        }

	},

	/**
	 * Remove model handler.
	 */
	removeModel: function(e) {
		e.preventDefault();
		this.remove();
		this.model.destroy();
	},

});

module.exports = ModuleEdit;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc3JjL2NvbGxlY3Rpb25zL21vZHVsZS1hdHRyaWJ1dGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzIiwiYXNzZXRzL2pzL3NyYy9nbG9iYWxzLmpzIiwiYXNzZXRzL2pzL3NyYy9tb2RlbHMvYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvbW9kZWxzL21vZHVsZS1hdHRyaWJ1dGUuanMiLCJhc3NldHMvanMvc3JjL21vZGVscy9tb2R1bGUuanMiLCJhc3NldHMvanMvc3JjL3VzdHdvLXBhZ2UtYnVpbGRlci5qcyIsImFzc2V0cy9qcy9zcmMvdXRpbHMvYXZhaWxhYmxlLW1vZHVsZXMuanMiLCJhc3NldHMvanMvc3JjL3V0aWxzL2VkaXQtdmlldy1tYXAuanMiLCJhc3NldHMvanMvc3JjL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9idWlsZGVyLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9maWVsZC1pbWFnZS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtYmxvY2txdW90ZS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtY2FzZS1zdHVkaWVzLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC1ncmlkLWNlbGwuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWdyaWQuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LWhlYWRlci5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UtbG9nby1oZWFkbGluZS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UuanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LXN0YXRzLmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC10ZXh0LmpzIiwiYXNzZXRzL2pzL3NyYy92aWV3cy9tb2R1bGUtZWRpdC10ZXh0YXJlYS5qcyIsImFzc2V0cy9qcy9zcmMvdmlld3MvbW9kdWxlLWVkaXQtdmlkZW8uanMiLCJhc3NldHMvanMvc3JjL3ZpZXdzL21vZHVsZS1lZGl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG52YXIgTW9kdWxlQXR0cmlidXRlID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbW9kdWxlLWF0dHJpYnV0ZS5qcycpO1xuXG4vKipcbiAqIFNob3J0Y29kZSBBdHRyaWJ1dGVzIGNvbGxlY3Rpb24uXG4gKi9cbnZhciBTaG9ydGNvZGVBdHRyaWJ1dGVzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXG5cdG1vZGVsIDogTW9kdWxlQXR0cmlidXRlLFxuXG5cdC8vIERlZXAgQ2xvbmUuXG5cdGNsb25lOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoIF8ubWFwKCB0aGlzLm1vZGVscywgZnVuY3Rpb24obSkge1xuXHRcdFx0cmV0dXJuIG0uY2xvbmUoKTtcblx0XHR9KSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBvbmx5IHRoZSBkYXRhIHRoYXQgbmVlZHMgdG8gYmUgc2F2ZWQuXG5cdCAqXG5cdCAqIEByZXR1cm4gb2JqZWN0XG5cdCAqL1xuXHR0b01pY3JvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IHt9O1xuXG5cdFx0dGhpcy5lYWNoKCBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0XHRqc29uWyBtb2RlbC5nZXQoICduYW1lJyApIF0gPSBtb2RlbC50b01pY3JvSlNPTigpO1xuXHRcdH0gKTtcblxuXHRcdHJldHVybiBqc29uO1xuXHR9LFxuXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3J0Y29kZUF0dHJpYnV0ZXM7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGUgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL21vZHVsZS5qcycpO1xuXG4vLyBTaG9ydGNvZGUgQ29sbGVjdGlvblxudmFyIE1vZHVsZXMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cblx0bW9kZWwgOiBNb2R1bGUsXG5cblx0Ly8gIERlZXAgQ2xvbmUuXG5cdGNsb25lIDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCBfLm1hcCggdGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdHJldHVybiBtLmNsb25lKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHJldHVybiB0aGlzLm1hcCggZnVuY3Rpb24obW9kZWwpIHsgcmV0dXJuIG1vZGVsLnRvTWljcm9KU09OKCBvcHRpb25zICk7IH0gKTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlcztcbiIsIi8vIEV4cG9zZSBzb21lIGZ1bmN0aW9uYWxpdHkgZ2xvYmFsbHkuXG52YXIgZ2xvYmFscyA9IHtcblx0QnVpbGRlcjogICAgICAgcmVxdWlyZSgnLi9tb2RlbHMvYnVpbGRlci5qcycpLFxuXHRCdWlsZGVyVmlldzogICByZXF1aXJlKCcuL3ZpZXdzL2J1aWxkZXIuanMnKSxcblx0TW9kdWxlRmFjdG9yeTogcmVxdWlyZSgnLi91dGlscy9tb2R1bGUtZmFjdG9yeS5qcycpLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxzO1xuIiwidmFyIEJhY2tib25lICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVzICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGVzLmpzJyk7XG52YXIgTW9kdWxlRmFjdG9yeSAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvbW9kdWxlLWZhY3RvcnkuanMnKTtcbnZhciBhdmFpbGFibGVNb2R1bGVzID0gcmVxdWlyZSgnLi8uLi91dGlscy9hdmFpbGFibGUtbW9kdWxlcy5qcycpO1xuXG52YXIgQnVpbGRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRzZWxlY3REZWZhdWx0OiAgdXNUd29QYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0LFxuXHRcdGFkZE5ld0J1dHRvbjogICB1c1R3b1BhZ2VCdWlsZGVyRGF0YS5sMTBuLmFkZE5ld0J1dHRvbixcblx0XHRzZWxlY3Rpb246ICAgICAgW10sIC8vIEluc3RhbmNlIG9mIE1vZHVsZXMuIENhbid0IHVzZSBhIGRlZmF1bHQsIG90aGVyd2lzZSB0aGV5IHdvbid0IGJlIHVuaXF1ZS5cblx0XHRhbGxvd2VkTW9kdWxlczogW10sIC8vIE1vZHVsZSBuYW1lcyBhbGxvd2VkIGZvciB0aGlzIGJ1aWxkZXIuXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBTZXQgZGVmYXVsdCBzZWxlY3Rpb24gdG8gZW5zdXJlIGl0IGlzbid0IGEgcmVmZXJlbmNlLlxuXHRcdGlmICggISAoIHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSBpbnN0YW5jZW9mIE1vZHVsZXMgKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnc2VsZWN0aW9uJywgbmV3IE1vZHVsZXMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdHNldERhdGE6IGZ1bmN0aW9uKCBkYXRhICkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbjtcblxuXHRcdGlmICggJycgPT09IGRhdGEgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIGVpdGhlciBKU09OIHN0cmluZyBvciBwcm9wZXIgb2JoZWN0LlxuXHRcdGRhdGEgPSAoICdzdHJpbmcnID09PSB0eXBlb2YgZGF0YSApID8gSlNPTi5wYXJzZSggZGF0YSApIDogZGF0YTtcblxuXHRcdC8vIENvbnZlcnQgc2F2ZWQgZGF0YSB0byBNb2R1bGUgbW9kZWxzLlxuXHRcdGlmICggZGF0YSAmJiBBcnJheS5pc0FycmF5KCBkYXRhICkgKSB7XG5cdFx0XHRzZWxlY3Rpb24gPSBkYXRhLm1hcCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdFx0cmV0dXJuIE1vZHVsZUZhY3RvcnkuY3JlYXRlKCBtb2R1bGUubmFtZSwgbW9kdWxlLmF0dHIgKTtcblx0XHRcdH0gKTtcblx0XHR9XG5cblx0XHQvLyBSZXNldCBzZWxlY3Rpb24gdXNpbmcgZGF0YSBmcm9tIGhpZGRlbiBpbnB1dC5cblx0XHRpZiAoIHNlbGVjdGlvbiAmJiBzZWxlY3Rpb24ubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLmFkZCggc2VsZWN0aW9uICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0c2F2ZURhdGE6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgPSBbXTtcblxuXHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5lYWNoKCBmdW5jdGlvbiggbW9kdWxlICkge1xuXG5cdFx0XHQvLyBTa2lwIGVtcHR5L2Jyb2tlbiBtb2R1bGVzLlxuXHRcdFx0aWYgKCAhIG1vZHVsZS5nZXQoJ25hbWUnICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZGF0YS5wdXNoKCBtb2R1bGUudG9NaWNyb0pTT04oKSApO1xuXG5cdFx0fSApO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnc2F2ZScsIGRhdGEgKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBMaXN0IGFsbCBhdmFpbGFibGUgbW9kdWxlcyBmb3IgdGhpcyBidWlsZGVyLlxuXHQgKiBBbGwgbW9kdWxlcywgZmlsdGVyZWQgYnkgdGhpcy5hbGxvd2VkTW9kdWxlcy5cblx0ICovXG5cdGdldEF2YWlsYWJsZU1vZHVsZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfLmZpbHRlciggYXZhaWxhYmxlTW9kdWxlcywgZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHJldHVybiB0aGlzLmlzTW9kdWxlQWxsb3dlZCggbW9kdWxlLm5hbWUgKTtcblx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHR9LFxuXG5cdGlzTW9kdWxlQWxsb3dlZDogZnVuY3Rpb24oIG1vZHVsZU5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhbGxvd2VkTW9kdWxlcycpLmluZGV4T2YoIG1vZHVsZU5hbWUgKSA+PSAwO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCJ2YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcblxudmFyIE1vZHVsZUF0dHJpYnV0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cblx0ZGVmYXVsdHM6IHtcblx0XHRuYW1lOiAgICAgICAgICcnLFxuXHRcdGxhYmVsOiAgICAgICAgJycsXG5cdFx0dmFsdWU6ICAgICAgICAnJyxcblx0XHR0eXBlOiAgICAgICAgICd0ZXh0Jyxcblx0XHRkZXNjcmlwdGlvbjogICcnLFxuXHRcdGRlZmF1bHRWYWx1ZTogJycsXG5cdFx0Y29uZmlnOiAgICAgICB7fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHIgPSB7fTtcblx0XHR2YXIgYWxsb3dlZEF0dHJQcm9wZXJ0aWVzID0gWyAnbmFtZScsICd2YWx1ZScsICd0eXBlJyBdO1xuXG5cdFx0Xy5lYWNoKCBhbGxvd2VkQXR0clByb3BlcnRpZXMsIGZ1bmN0aW9uKCBwcm9wICkge1xuXHRcdFx0clsgcHJvcCBdID0gdGhpcy5nZXQoIHByb3AgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdHJldHVybiByO1xuXG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlQXR0cmlidXRlO1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBNb2R1bGVBdHRzID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xuXG52YXIgTW9kdWxlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG5hbWU6ICAnJyxcblx0XHRsYWJlbDogJycsXG5cdFx0YXR0cjogIFtdLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uIHRvIGVuc3VyZSBpdCBpc24ndCBhIHJlZmVyZW5jZS5cblx0XHRpZiAoICEgKCB0aGlzLmdldCgnYXR0cicpIGluc3RhbmNlb2YgTW9kdWxlQXR0cyApICkge1xuXHRcdFx0dGhpcy5zZXQoICdhdHRyJywgbmV3IE1vZHVsZUF0dHMoKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgYW4gYXR0cmlidXRlIG1vZGVsIGJ5IG5hbWUuXG5cdCAqL1xuXHRnZXRBdHRyOiBmdW5jdGlvbiggYXR0ck5hbWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0KCdhdHRyJykuZmluZFdoZXJlKCB7IG5hbWU6IGF0dHJOYW1lIH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDdXN0b20gUGFyc2UuXG5cdCAqIEVuc3VyZXMgYXR0cmlidXRlcyBpcyBhbiBpbnN0YW5jZSBvZiBNb2R1bGVBdHRzXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG5cdFx0aWYgKCAnYXR0cicgaW4gcmVzcG9uc2UgJiYgISAoIHJlc3BvbnNlLmF0dHIgaW5zdGFuY2VvZiBNb2R1bGVBdHRzICkgKSB7XG5cdFx0XHRyZXNwb25zZS5hdHRyID0gbmV3IE1vZHVsZUF0dHMoIHJlc3BvbnNlLmF0dHIgKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiByZXNwb25zZTtcblxuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIganNvbiA9IF8uY2xvbmUoIHRoaXMuYXR0cmlidXRlcyApO1xuXG5cdFx0aWYgKCAnYXR0cicgaW4ganNvbiAmJiAoIGpzb24uYXR0ciBpbnN0YW5jZW9mIE1vZHVsZUF0dHMgKSApIHtcblx0XHRcdGpzb24uYXR0ciA9IGpzb24uYXR0ci50b0pTT04oKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ganNvbjtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gb25seSB0aGUgZGF0YSB0aGF0IG5lZWRzIHRvIGJlIHNhdmVkLlxuXHQgKlxuXHQgKiBAcmV0dXJuIG9iamVjdFxuXHQgKi9cblx0dG9NaWNyb0pTT046IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiB0aGlzLmdldCgnbmFtZScpLFxuXHRcdFx0YXR0cjogdGhpcy5nZXQoJ2F0dHInKS50b01pY3JvSlNPTigpXG5cdFx0fTtcblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlO1xuIiwidmFyICQgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgQnVpbGRlclZpZXcgICA9IHJlcXVpcmUoJy4vdmlld3MvYnVpbGRlci5qcycpO1xuXG4vLyBFeHBvc2Ugc29tZSBmdW5jdGlvbmFsaXR5IHRvIGdsb2JhbCBuYW1lc3BhY2UuXG53aW5kb3cudXN0d29QYWdlQnVpbGRlciA9IHJlcXVpcmUoJy4vZ2xvYmFscycpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG5cdC8vIEEgZmllbGQgZm9yIHN0b3JpbmcgdGhlIGJ1aWxkZXIgZGF0YS5cblx0dmFyICRmaWVsZCA9ICQoICdbbmFtZT11c3R3by1wYWdlLWJ1aWxkZXItZGF0YV0nICk7XG5cblx0aWYgKCAhICRmaWVsZC5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gQSBjb250YWluZXIgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0aGUgYnVpbGRlci5cblx0dmFyICRjb250YWluZXIgPSAkKCAnI3VzdHdvLXBhZ2UtYnVpbGRlcicgKTtcblxuXHQvLyBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQnVpbGRlciBtb2RlbC5cblx0Ly8gUGFzcyBhbiBhcnJheSBvZiBtb2R1bGUgbmFtZXMgdGhhdCBhcmUgYWxsb3dlZCBmb3IgdGhpcyBidWlsZGVyLlxuXHR2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKHtcblx0XHRhbGxvd2VkTW9kdWxlczogJCggJ1tuYW1lPXVzdHdvLXBhZ2UtYnVpbGRlci1hbGxvd2VkLW1vZHVsZXNdJyApLnZhbCgpLnNwbGl0KCcsJylcblx0fSk7XG5cblx0Ly8gU2V0IHRoZSBkYXRhIHVzaW5nIHRoZSBjdXJyZW50IGZpZWxkIHZhbHVlXG5cdGJ1aWxkZXIuc2V0RGF0YSggSlNPTi5wYXJzZSggJGZpZWxkLnZhbCgpICkgKTtcblxuXHQvLyBPbiBzYXZlLCB1cGRhdGUgdGhlIGZpZWxkIHZhbHVlLlxuXHRidWlsZGVyLm9uKCAnc2F2ZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdCRmaWVsZC52YWwoIEpTT04uc3RyaW5naWZ5KCBkYXRhICkgKTtcblx0fSApO1xuXG5cdC8vIENyZWF0ZSBidWlsZGVyIHZpZXcuXG5cdHZhciBidWlsZGVyVmlldyA9IG5ldyBCdWlsZGVyVmlldyggeyBtb2RlbDogYnVpbGRlciB9ICk7XG5cblx0Ly8gUmVuZGVyIGJ1aWxkZXIuXG5cdGJ1aWxkZXJWaWV3LnJlbmRlcigpLiRlbC5hcHBlbmRUbyggJGNvbnRhaW5lciApO1xuXG59KTtcbiIsIi8qKlxuICogQXZhaWxhYmxlIE1vZHVsZXMuXG4gKlxuICogQWxsIGF2YWlsYWJsZSBtb2R1bGVzIG11c3QgYmUgcmVnaXN0ZXJlZCBieSBhZGluZyB0aGVtIHRvIHRoZSBhcnJheSBvZiBhdmFpbGFibGVNb2R1bGVzLlxuICogQWxsIGRlZmF1bHQgbW9kZWwgZGF0YSBtdXN0IGJlIGRlZmluZWQgaGVyZS5cbiAqIE9ubHkgdGhlICd2YWx1ZScgb2YgZWFjaCBhdHRyaWJ1dGUgaXMgc2F2ZWQuXG4gKi9cbnZhciBhdmFpbGFibGVNb2R1bGVzID0gW107XG5cbmF2YWlsYWJsZU1vZHVsZXMucHVzaCh7XG5cdGxhYmVsOiAnSGVhZGVyJyxcblx0bmFtZTogICdoZWFkZXInLFxuXHRhdHRyOiBbXG5cdFx0eyBuYW1lOiAnaGVhZGluZycsICAgIGxhYmVsOiAnSGVhZGluZycsICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnIH0sXG5cdFx0eyBuYW1lOiAnc3ViaGVhZGluZycsIGxhYmVsOiAnU3ViaGVhZGluZyAob3B0aW9uYWwpJywgdHlwZTogJ3RleHRhcmVhJyB9LFxuXHRdXG59KTtcblxuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKHtcblx0bGFiZWw6ICdUZXh0Jyxcblx0bmFtZTogICd0ZXh0Jyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ2hlYWRpbmcnLCBsYWJlbDogJ0hlYWRpbmcnLCB0eXBlOiAndGV4dCcgfSxcblx0XHR7IG5hbWU6ICdib2R5JywgICAgbGFiZWw6ICdDb250ZW50JywgdHlwZTogJ3d5c2l3eWcnIH0sXG5cdF1cbn0pO1xuXG5hdmFpbGFibGVNb2R1bGVzLnB1c2goe1xuXHRuYW1lOiAgJ3N0YXRzJyxcblx0bGFiZWw6ICdTdGF0cy9GaWd1cmVzJyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ3RpdGxlJywgbGFiZWw6ICdUaXRsZScsICAgIHR5cGU6ICd0ZXh0JyB9LFxuXHRcdHsgbmFtZTogJ2NvbDEnLCAgbGFiZWw6ICdDb2x1bW4gMScsIHR5cGU6ICd0ZXh0YXJlYScgfSxcblx0XHR7IG5hbWU6ICdjb2wyJywgIGxhYmVsOiAnQ29sdW1uIDInLCB0eXBlOiAndGV4dGFyZWEnIH0sXG5cdFx0eyBuYW1lOiAnY29sMycsICBsYWJlbDogJ0NvbHVtbiAzJywgdHlwZTogJ3RleHRhcmVhJyB9LFxuXHRdXG59KTtcblxuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKHtcblx0bmFtZTogICd2aWRlbycsXG5cdGxhYmVsOiAnVmlkZW8nLFxuXHRhdHRyOiBbXG5cdFx0eyBuYW1lOiAndmlkZW9faWQnLCBsYWJlbDogJ1ZpbWVvIFZpZGVvIElEJywgdHlwZTogJ3RleHQnIH0sXG5cdF1cbn0pO1xuXG5hdmFpbGFibGVNb2R1bGVzLnB1c2goe1xuXHRsYWJlbDogJ0ltYWdlJyxcblx0bmFtZTogJ2ltYWdlJyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ2ltYWdlJywgICBsYWJlbDogJ0ltYWdlJywgICB0eXBlOiAnaW1hZ2UnLCBjb25maWc6IHsgbXVsdGlwbGU6IGZhbHNlLCBzaXplUmVxOiB7IHdpZHRoOiAxMDI0LCBoZWlnaHQ6IDc2OCB9IH0gfSxcblx0XHR7IG5hbWU6ICdjYXB0aW9uJywgbGFiZWw6ICdDYXB0aW9uJywgdHlwZTogJ2ltYWdlJyB9LFxuXHRdXG59KTtcblxuYXZhaWxhYmxlTW9kdWxlcy5wdXNoKHtcblx0bmFtZTogJ2Jsb2NrcXVvdGUnLFxuXHRsYWJlbDogJ0xhcmdlIFF1b3RlJyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ3RleHQnLCAgICAgbGFiZWw6ICdRdW90ZSBUZXh0JywgIHR5cGU6ICd0ZXh0YXJlYScgfSxcblx0XHR7IG5hbWU6ICdzb3VyY2UnLCAgIGxhYmVsOiAnU291cmNlJywgICAgICB0eXBlOiAndGV4dCcgfSxcblx0XVxufSApO1xuXG5hdmFpbGFibGVNb2R1bGVzLnB1c2goe1xuXHRsYWJlbDogJ0Nhc2UgU3R1ZGllcycsXG5cdG5hbWU6ICAnY2FzZV9zdHVkaWVzJyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ2Nhc2Vfc3R1ZGllcycsIGxhYmVsOiAnQ2FzZSBTdHVkaWVzJywgdHlwZTogJ3Bvc3RJRCcgfSxcblx0XVxufSk7XG5cbmF2YWlsYWJsZU1vZHVsZXMucHVzaCh7XG5cdGxhYmVsOiAnQ29udGVudCBHcmlkJyxcblx0bmFtZTogICdncmlkJyxcblx0YXR0cjogW1xuXHRcdHsgbmFtZTogJ2dyaWRfY2VsbHMnLCBsYWJlbDogJ0dyaWQgQ2VsbHMnLCB0eXBlOiAnYnVpbGRlcicgfSxcblx0XHR7IG5hbWU6ICdncmlkX3ZpZGVvJywgbGFiZWw6ICdWaWRlbycsIHR5cGU6ICd2aWRlbycgfSxcblx0XHR7IG5hbWU6ICdncmlkX2ltYWdlJywgbGFiZWw6ICdJbWFnZScsIHR5cGU6ICdpbWFnZScgfSxcblx0XVxufSk7XG5cbmF2YWlsYWJsZU1vZHVsZXMucHVzaCh7XG5cdGxhYmVsOiAnVGV4dC9JbWFnZSBDZWxsJyxcblx0bmFtZTogICdncmlkX2NlbGwnLFxuXHRhdHRyOiBbXG5cdFx0eyBuYW1lOiAnaGVhZGluZycsIGxhYmVsOiAnSGVhZGluZycsIHR5cGU6ICd0ZXh0JyB9LFxuXHRcdHsgbmFtZTogJ2JvZHknLCAgICBsYWJlbDogJ0NvbnRlbnQnLCB0eXBlOiAnd3lzaXd5ZycgfSxcblx0XHR7IG5hbWU6ICdpbWFnZScsICAgbGFiZWw6ICdJbWFnZScsICAgdHlwZTogJ2ltYWdlJywgY29uZmlnOiB7IHNpemVSZXE6IHsgd2lkdGg6IDY0MCwgaGVpZ2h0OiA0ODAgfSB9IH0sXG5cdF1cbn0pO1xuXG5hdmFpbGFibGVNb2R1bGVzLnB1c2goe1xuXHRsYWJlbDogJ0ltYWdlIHdpdGggbG9nbyBhbmQgaGVhZGluZycsXG5cdG5hbWU6ICAnaW1hZ2VfbG9nb19oZWFkbGluZScsXG5cdGF0dHI6IFtcblx0XHR7IG5hbWU6ICdoZWFkaW5nJywgbGFiZWw6ICdIZWFkaW5nJywgdHlwZTogJ3RleHQnIH0sXG5cdFx0eyBuYW1lOiAnaW1hZ2UnLCAgIGxhYmVsOiAnSW1hZ2UnLCAgIHR5cGU6ICdpbWFnZScsIGNvbmZpZzogeyBzaXplUmVxOiB7IHdpZHRoOiAxMDI0LCBoZWlnaHQ6IDc2OCB9IH0gfSxcblx0XVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXZhaWxhYmxlTW9kdWxlcztcbiIsIi8qKlxuICogTWFwIG1vZHVsZSB0eXBlIHRvIHZpZXdzLlxuICovXG52YXIgZWRpdFZpZXdNYXAgPSB7XG5cdCdoZWFkZXInOiAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1oZWFkZXIuanMnKSxcblx0J3RleHRhcmVhJzogICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LXRleHRhcmVhLmpzJyksXG5cdCd0ZXh0JzogICAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC10ZXh0LmpzJyksXG5cdCdzdGF0cyc6ICAgICAgICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1zdGF0cy5qcycpLFxuXHQnaW1hZ2UnOiAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UuanMnKSxcblx0J3ZpZGVvJzogICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LXZpZGVvLmpzJyksXG5cdCdibG9ja3F1b3RlJzogICAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1ibG9ja3F1b3RlLmpzJyksXG5cdCdjYXNlX3N0dWRpZXMnOiAgICAgICAgcmVxdWlyZSgnLi8uLi92aWV3cy9tb2R1bGUtZWRpdC1jYXNlLXN0dWRpZXMuanMnKSxcblx0J2dyaWQnOiAgICAgICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWdyaWQuanMnKSxcblx0J2dyaWRfY2VsbCc6ICAgICAgICAgICByZXF1aXJlKCcuLy4uL3ZpZXdzL21vZHVsZS1lZGl0LWdyaWQtY2VsbC5qcycpLFxuXHQnaW1hZ2VfbG9nb19oZWFkbGluZSc6IHJlcXVpcmUoJy4vLi4vdmlld3MvbW9kdWxlLWVkaXQtaW1hZ2UtbG9nby1oZWFkbGluZS5qcycpLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBlZGl0Vmlld01hcDtcbiIsInZhciBhdmFpbGFibGVNb2R1bGVzID0gcmVxdWlyZSgnLi9hdmFpbGFibGUtbW9kdWxlcy5qcycpO1xudmFyIE1vZHVsZSAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9tb2R1bGUuanMnKTtcbnZhciBNb2R1bGVBdHRzICAgICAgID0gcmVxdWlyZSgnLi8uLi9jb2xsZWN0aW9ucy9tb2R1bGUtYXR0cmlidXRlcy5qcycpO1xudmFyICQgICAgICAgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgTW9kdWxlRmFjdG9yeSA9IHtcblxuXHQvKipcblx0ICogQ3JlYXRlIE1vZHVsZSBNb2RlbC5cblx0ICogVXNlIGRhdGEgZnJvbSBjb25maWcsIHBsdXMgc2F2ZWQgZGF0YS5cblx0ICpcblx0ICogQHBhcmFtICBzdHJpbmcgbW9kdWxlTmFtZVxuXHQgKiBAcGFyYW0gIG9iamVjdCBhdHRyaWJ1dGUgSlNPTi4gU2F2ZWQgYXR0cmlidXRlIHZhbHVlcy5cblx0ICogQHJldHVybiBNb2R1bGVcblx0ICovXG5cdGNyZWF0ZTogZnVuY3Rpb24oIG1vZHVsZU5hbWUsIGF0dHJEYXRhICkge1xuXG5cdFx0dmFyIGRhdGEgPSAkLmV4dGVuZCggdHJ1ZSwge30sIF8uZmluZFdoZXJlKCBhdmFpbGFibGVNb2R1bGVzLCB7IG5hbWU6IG1vZHVsZU5hbWUgfSApICk7XG5cblx0XHRpZiAoICEgZGF0YSApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHZhciBhdHRyaWJ1dGVzID0gbmV3IE1vZHVsZUF0dHMoKTtcblxuXHRcdC8qKlxuXHRcdCAqIEFkZCBhbGwgdGhlIG1vZHVsZSBhdHRyaWJ1dGVzLlxuXHRcdCAqIFdoaXRlbGlzdGVkIHRvIGF0dHJpYnV0ZXMgZG9jdW1lbnRlZCBpbiBzY2hlbWFcblx0XHQgKiBTZXRzIG9ubHkgdmFsdWUgZnJvbSBhdHRyRGF0YS5cblx0XHQgKi9cblx0XHRfLmVhY2goIGRhdGEuYXR0ciwgZnVuY3Rpb24oIGF0dHIgKSB7XG5cblx0XHRcdHZhciBjbG9uZUF0dHIgPSAkLmV4dGVuZCggdHJ1ZSwge30sIGF0dHIgICk7XG5cdFx0XHR2YXIgc2F2ZWRBdHRyID0gXy5maW5kV2hlcmUoIGF0dHJEYXRhLCB7IG5hbWU6IGF0dHIubmFtZSB9ICk7XG5cblx0XHRcdC8vIEFkZCBzYXZlZCBhdHRyaWJ1dGUgdmFsdWVzLlxuXHRcdFx0aWYgKCBzYXZlZEF0dHIgJiYgJ3ZhbHVlJyBpbiBzYXZlZEF0dHIgKSB7XG5cdFx0XHRcdGNsb25lQXR0ci52YWx1ZSA9IHNhdmVkQXR0ci52YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0YXR0cmlidXRlcy5hZGQoIGNsb25lQXR0ciApO1xuXG5cdFx0fSApO1xuXG5cdFx0ZGF0YS5hdHRyID0gYXR0cmlidXRlcztcblxuXHQgICAgcmV0dXJuIG5ldyBNb2R1bGUoIGRhdGEgKTtcblxuXHR9LFxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUZhY3Rvcnk7XG4iLCJ2YXIgQmFja2JvbmUgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIEJ1aWxkZXIgICAgICAgPSByZXF1aXJlKCcuLy4uL21vZGVscy9idWlsZGVyLmpzJyk7XG52YXIgZWRpdFZpZXdNYXAgICA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvZWRpdC12aWV3LW1hcC5qcycpO1xudmFyIE1vZHVsZUZhY3RvcnkgPSByZXF1aXJlKCcuLy4uL3V0aWxzL21vZHVsZS1mYWN0b3J5LmpzJyk7XG52YXIgJCAgICAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbnZhciBCdWlsZGVyID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCcjdG1wbC11c3R3by1idWlsZGVyJyApLmh0bWwoKSxcblx0Y2xhc3NOYW1lOiAndXN0d28tcGFnZS1idWlsZGVyJyxcblx0bW9kZWw6IG51bGwsXG5cdG5ld01vZHVsZU5hbWU6IG51bGwsXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NoYW5nZSA+IC5hZGQtbmV3IC5hZGQtbmV3LW1vZHVsZS1zZWxlY3QnOiAndG9nZ2xlQnV0dG9uU3RhdHVzJyxcblx0XHQnY2xpY2sgPiAuYWRkLW5ldyAuYWRkLW5ldy1tb2R1bGUtYnV0dG9uJzogJ2FkZE1vZHVsZScsXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5tb2RlbC5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0c2VsZWN0aW9uLm9uKCAnYWRkJywgdGhpcy5hZGROZXdTZWxlY3Rpb25JdGVtVmlldywgdGhpcyApO1xuXHRcdHNlbGVjdGlvbi5vbiggJ2FsbCcsIHRoaXMubW9kZWwuc2F2ZURhdGEsIHRoaXMubW9kZWwgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZGF0YSA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cblx0XHR0aGlzLiRlbC5odG1sKCBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCBkYXRhICApICk7XG5cblx0XHR0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIG1vZHVsZSApIHtcblx0XHRcdHRoaXMuYWRkTmV3U2VsZWN0aW9uSXRlbVZpZXcoIG1vZHVsZSApO1xuXHRcdH0uYmluZCggdGhpcyApICk7XG5cblx0XHR0aGlzLnJlbmRlckFkZE5ldygpO1xuXHRcdHRoaXMuaW5pdFNvcnRhYmxlKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgdGhlIEFkZCBOZXcgbW9kdWxlIGNvbnRyb2xzLlxuXHQgKi9cblx0cmVuZGVyQWRkTmV3OiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciAkc2VsZWN0ID0gdGhpcy4kZWwuZmluZCggJz4gLmFkZC1uZXcgc2VsZWN0LmFkZC1uZXctbW9kdWxlLXNlbGVjdCcgKTtcblxuXHRcdCRzZWxlY3QuYXBwZW5kKFxuXHRcdFx0JCggJzxvcHRpb24vPicsIHsgdGV4dDogdXNUd29QYWdlQnVpbGRlckRhdGEubDEwbi5zZWxlY3REZWZhdWx0IH0gKVxuXHRcdCk7XG5cblx0XHRfLmVhY2goIHRoaXMubW9kZWwuZ2V0QXZhaWxhYmxlTW9kdWxlcygpLCBmdW5jdGlvbiggbW9kdWxlICkge1xuXHRcdFx0dmFyIHRlbXBsYXRlID0gJzxvcHRpb24gdmFsdWU9XCI8JT0gbmFtZSAlPlwiPjwlPSBsYWJlbCAlPjwvb3B0aW9uPic7XG5cdFx0XHQkc2VsZWN0LmFwcGVuZCggXy50ZW1wbGF0ZSggdGVtcGxhdGUsIG1vZHVsZSApICk7XG5cdFx0fSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgU29ydGFibGUuXG5cdCAqL1xuXHRpbml0U29ydGFibGU6IGZ1bmN0aW9uKCkge1xuXHRcdCQoICc+IC5zZWxlY3Rpb24nLCB0aGlzLiRlbCApLnNvcnRhYmxlKHtcblx0XHRcdGhhbmRsZTogJy5tb2R1bGUtZWRpdC10b29scycsXG5cdFx0XHRpdGVtczogJz4gLm1vZHVsZS1lZGl0Jyxcblx0XHRcdHN0b3A6IHRoaXMudXBkYXRlU2VsZWN0aW9uT3JkZXIuYmluZCggdGhpcyApLFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTb3J0YWJsZSBlbmQgY2FsbGJhY2suXG5cdCAqIEFmdGVyIHJlb3JkZXJpbmcsIHVwZGF0ZSB0aGUgc2VsZWN0aW9uIG9yZGVyLlxuXHQgKiBOb3RlIC0gdXNlcyBkaXJlY3QgbWFuaXB1bGF0aW9uIG9mIGNvbGxlY3Rpb24gbW9kZWxzIHByb3BlcnR5LlxuXHQgKiBUaGlzIGlzIHRvIGF2b2lkIGhhdmluZyB0byBtZXNzIGFib3V0IHdpdGggdGhlIHZpZXdzIHRoZW1zZWx2ZXMuXG5cdCAqL1xuXHR1cGRhdGVTZWxlY3Rpb25PcmRlcjogZnVuY3Rpb24oIGUsIHVpICkge1xuXG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMubW9kZWwuZ2V0KCdzZWxlY3Rpb24nKTtcblx0XHR2YXIgaXRlbSAgICAgID0gc2VsZWN0aW9uLmdldCh7IGNpZDogdWkuaXRlbS5hdHRyKCAnZGF0YS1jaWQnKSB9KTtcblx0XHR2YXIgbmV3SW5kZXggID0gdWkuaXRlbS5pbmRleCgpO1xuXHRcdHZhciBvbGRJbmRleCAgPSBzZWxlY3Rpb24uaW5kZXhPZiggaXRlbSApO1xuXG5cdFx0aWYgKCBuZXdJbmRleCAhPT0gb2xkSW5kZXggKSB7XG5cdFx0XHR2YXIgZHJvcHBlZCA9IHNlbGVjdGlvbi5tb2RlbHMuc3BsaWNlKCBvbGRJbmRleCwgMSApO1xuXHRcdFx0c2VsZWN0aW9uLm1vZGVscy5zcGxpY2UoIG5ld0luZGV4LCAwLCBkcm9wcGVkWzBdICk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmVEYXRhKCk7XG5cdFx0fVxuXG5cdH0sXG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBidXR0b24gc3RhdHVzLlxuXHQgKiBFbmFibGUvRGlzYWJsZSBidXR0b24gZGVwZW5kaW5nIG9uIHdoZXRoZXJcblx0ICogcGxhY2Vob2xkZXIgb3IgdmFsaWQgbW9kdWxlIGlzIHNlbGVjdGVkLlxuXHQgKi9cblx0dG9nZ2xlQnV0dG9uU3RhdHVzOiBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIHZhbHVlICAgICAgICAgPSAkKGUudGFyZ2V0KS52YWwoKTtcblx0XHR2YXIgZGVmYXVsdE9wdGlvbiA9ICQoZS50YXJnZXQpLmNoaWxkcmVuKCkuZmlyc3QoKS5hdHRyKCd2YWx1ZScpO1xuXHRcdCQoJy5hZGQtbmV3LW1vZHVsZS1idXR0b24nLCB0aGlzLiRlbCApLmF0dHIoICdkaXNhYmxlZCcsIHZhbHVlID09PSBkZWZhdWx0T3B0aW9uICk7XG5cdFx0dGhpcy5uZXdNb2R1bGVOYW1lID0gKCB2YWx1ZSAhPT0gZGVmYXVsdE9wdGlvbiApID8gdmFsdWUgOiBudWxsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgYWRkaW5nIG1vZHVsZS5cblx0ICpcblx0ICogRmluZCBtb2R1bGUgbW9kZWwuIENsb25lIGl0LiBBZGQgdG8gc2VsZWN0aW9uLlxuXHQgKi9cblx0YWRkTW9kdWxlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIHRoaXMubmV3TW9kdWxlTmFtZSAmJiB0aGlzLm1vZGVsLmlzTW9kdWxlQWxsb3dlZCggdGhpcy5uZXdNb2R1bGVOYW1lICkgKSB7XG5cdFx0XHR2YXIgbW9kZWwgPSBNb2R1bGVGYWN0b3J5LmNyZWF0ZSggdGhpcy5uZXdNb2R1bGVOYW1lICk7XG5cdFx0XHR0aGlzLm1vZGVsLmdldCgnc2VsZWN0aW9uJykuYWRkKCBtb2RlbCApO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBcHBlbmQgbmV3IHNlbGVjdGlvbiBpdGVtIHZpZXcuXG5cdCAqL1xuXHRhZGROZXdTZWxlY3Rpb25JdGVtVmlldzogZnVuY3Rpb24oIGl0ZW0gKSB7XG5cblx0XHR2YXIgZWRpdFZpZXcsIHZpZXc7XG5cblx0XHRlZGl0VmlldyA9ICggaXRlbS5nZXQoJ25hbWUnKSBpbiBlZGl0Vmlld01hcCApID8gZWRpdFZpZXdNYXBbIGl0ZW0uZ2V0KCduYW1lJykgXSA6IG51bGw7XG5cblx0XHRpZiAoICEgZWRpdFZpZXcgfHwgISB0aGlzLm1vZGVsLmlzTW9kdWxlQWxsb3dlZCggaXRlbS5nZXQoJ25hbWUnKSApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZpZXcgPSBuZXcgZWRpdFZpZXcoIHsgbW9kZWw6IGl0ZW0gfSApO1xuXG5cdFx0JCggJz4gLnNlbGVjdGlvbicsIHRoaXMuJGVsICkuYXBwZW5kKCB2aWV3LnJlbmRlcigpLiRlbCApO1xuXG5cdFx0dmFyICRzZWxlY3Rpb24gPSAkKCAnPiAuc2VsZWN0aW9uJywgdGhpcy4kZWwgKTtcblx0XHRpZiAoICRzZWxlY3Rpb24uaGFzQ2xhc3MoJ3VpLXNvcnRhYmxlJykgKSB7XG5cdFx0XHQkc2VsZWN0aW9uLnNvcnRhYmxlKCdyZWZyZXNoJyk7XG5cdFx0fVxuXG5cblx0fSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVpbGRlcjtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuLyoqXG4gKiBJbWFnZSBGaWVsZFxuICpcbiAqIEluaXRpYWxpemUgYW5kIGxpc3RlbiBmb3IgdGhlICdjaGFuZ2UnIGV2ZW50IHRvIGdldCB1cGRhdGVkIGRhdGEuXG4gKlxuICovXG52YXIgRmllbGRJbWFnZSA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogICQoICcjdG1wbC11c3R3by1maWVsZC1pbWFnZScgKS5odG1sKCksXG5cdGZyYW1lOiAgICAgbnVsbCxcblx0aW1hZ2VBdHRyOiBudWxsLFxuXHRjb25maWc6ICAgIHt9LFxuXHR2YWx1ZTogICAgIFtdLCAvLyBBdHRhY2htZW50IElEcy5cblx0c2VsZWN0aW9uOiB7fSwgLy8gQXR0YWNobWVudHMgY29sbGVjdGlvbiBmb3IgdGhpcy52YWx1ZS5cblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24uYWRkJzogJ2VkaXRJbWFnZScsXG5cdFx0J2NsaWNrIC5pbWFnZS1wbGFjZWhvbGRlciBpbWcnOiAnZWRpdEltYWdlJyxcblx0XHQnY2xpY2sgLmltYWdlLXBsYWNlaG9sZGVyIC5idXR0b24ucmVtb3ZlJzogJ3JlbW92ZUltYWdlJyxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZS5cblx0ICpcblx0ICogUGFzcyB2YWx1ZSBhbmQgY29uZmlnIGFzIHByb3BlcnRpZXMgb24gdGhlIG9wdGlvbnMgb2JqZWN0LlxuXHQgKiBBdmFpbGFibGUgb3B0aW9uc1xuXHQgKiAtIG11bHRpcGxlOiBib29sXG5cdCAqIC0gc2l6ZVJlcTogZWcgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9XG5cdCAqXG5cdCAqIEBwYXJhbSAgb2JqZWN0IG9wdGlvbnNcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ3JlbmRlcicsICdlZGl0SW1hZ2UnLCAnb25TZWxlY3RJbWFnZScsICdyZW1vdmVJbWFnZScsICdpc0F0dGFjaG1lbnRTaXplT2snICk7XG5cblx0XHRpZiAoICd2YWx1ZScgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMudmFsdWUgPSBvcHRpb25zLnZhbHVlO1xuXHRcdH1cblxuXHRcdC8vIEVuc3VyZSB2YWx1ZSBpcyBhcnJheS5cblx0XHRpZiAoICEgdGhpcy52YWx1ZSB8fCAhIEFycmF5LmlzQXJyYXkoIHRoaXMudmFsdWUgKSApIHtcblx0XHRcdHRoaXMudmFsdWUgPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoICdjb25maWcnIGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLmNvbmZpZyA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRcdH0sIG9wdGlvbnMuY29uZmlnICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vbiggJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cblx0XHR0aGlzLmluaXRTZWxlY3Rpb24oKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIFNlbGVjdGlvbi5cblx0ICpcblx0ICogU2VsZWN0aW9uIGlzIGFuIEF0dGFjaG1lbnQgY29sbGVjdGlvbiBjb250YWluaW5nIGZ1bGwgbW9kZWxzIGZvciB0aGUgY3VycmVudCB2YWx1ZS5cblx0ICpcblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRpbml0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbmV3IHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzKCk7XG5cblx0XHQvLyBJbml0aWFsaXplIHNlbGVjdGlvbi5cblx0XHRfLmVhY2goIHRoaXMudmFsdWUsIGZ1bmN0aW9uKCBpdGVtICkge1xuXG5cdFx0XHR2YXIgbW9kZWw7XG5cblx0XHRcdC8vIExlZ2FjeS4gSGFuZGxlIHN0b3JpbmcgZnVsbCBvYmplY3RzLlxuXHRcdFx0aXRlbSAgPSAoICdvYmplY3QnID09PSB0eXBlb2YoIGl0ZW0gKSApID8gaXRlbS5pZCA6IGl0ZW07XG5cdFx0XHRtb2RlbCA9IG5ldyB3cC5tZWRpYS5hdHRhY2htZW50KCBpdGVtICk7XG5cblx0XHRcdHRoaXMuc2VsZWN0aW9uLmFkZCggbW9kZWwgKTtcblxuXHRcdFx0Ly8gUmUtcmVuZGVyIGFmdGVyIGF0dGFjaG1lbnRzIGhhdmUgc3luY2VkLlxuXHRcdFx0bW9kZWwuZmV0Y2goKTtcblx0XHRcdG1vZGVsLm9uKCAnc3luYycsIHRoaXMucmVuZGVyICk7XG5cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdGVtcGxhdGU7XG5cblx0XHR0ZW1wbGF0ZSA9IF8ubWVtb2l6ZSggZnVuY3Rpb24oIHZhbHVlLCBjb25maWcgKSB7XG5cdFx0XHRyZXR1cm4gXy50ZW1wbGF0ZSggdGhpcy50ZW1wbGF0ZSwge1xuXHRcdFx0XHR2YWx1ZTogdmFsdWUsXG5cdFx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdFx0fSApO1xuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCggdGVtcGxhdGUoIHRoaXMuc2VsZWN0aW9uLnRvSlNPTigpLCB0aGlzLmNvbmZpZyApICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdG9uU2VsZWN0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZSB8fCBudWxsO1xuXG5cdFx0aWYgKCAhIGZyYW1lICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMudmFsdWUgPSBbXTtcblx0XHR0aGlzLnNlbGVjdGlvbi5yZXNldChbXSk7XG5cblx0XHRmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZWFjaCggZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cblx0XHRcdGlmICggdGhpcy5pc0F0dGFjaG1lbnRTaXplT2soIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdFx0dGhpcy52YWx1ZS5wdXNoKCBhdHRhY2htZW50LmdldCgnaWQnKSApO1xuXHRcdFx0XHR0aGlzLnNlbGVjdGlvbi5hZGQoIGF0dGFjaG1lbnQgKTtcblx0XHRcdH1cblxuXHRcdH0uYmluZCh0aGlzKSApO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy52YWx1ZSApO1xuXG5cdFx0ZnJhbWUuY2xvc2UoKTtcblxuXHR9LFxuXG5cdGVkaXRJbWFnZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZTtcblxuXHRcdGlmICggISBmcmFtZSApIHtcblxuXHRcdFx0dmFyIGZyYW1lQXJncyA9IHtcblx0XHRcdFx0bGlicmFyeTogeyB0eXBlOiAnaW1hZ2UnIH0sXG5cdFx0XHRcdG11bHRpcGxlOiB0aGlzLmNvbmZpZy5tdWx0aXBsZSxcblx0XHRcdFx0dGl0bGU6ICdTZWxlY3QgSW1hZ2UnLFxuXHRcdFx0XHRmcmFtZTogJ3NlbGVjdCcsXG5cdFx0XHR9O1xuXG5cdFx0XHRmcmFtZSA9IHRoaXMuZnJhbWUgPSB3cC5tZWRpYSggZnJhbWVBcmdzICk7XG5cblx0XHRcdGZyYW1lLm9uKCAnY29udGVudDpjcmVhdGU6YnJvd3NlJywgdGhpcy5zZXR1cEZpbHRlcnMsIHRoaXMgKTtcblx0XHRcdGZyYW1lLm9uKCAnc2VsZWN0JywgdGhpcy5vblNlbGVjdEltYWdlLCB0aGlzICk7XG5cblx0XHR9XG5cblx0XHQvLyBXaGVuIHRoZSBmcmFtZSBvcGVucywgc2V0IHRoZSBzZWxlY3Rpb24uXG5cdFx0ZnJhbWUub24oICdvcGVuJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBzZWxlY3Rpb24gPSBmcmFtZS5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJyk7XG5cblx0XHRcdC8vIFNldCB0aGUgc2VsZWN0aW9uLlxuXHRcdFx0Ly8gTm90ZSAtIGV4cGVjdHMgYXJyYXkgb2Ygb2JqZWN0cywgbm90IGEgY29sbGVjdGlvbi5cblx0XHRcdHNlbGVjdGlvbi5zZXQoIHRoaXMuc2VsZWN0aW9uLm1vZGVscyApO1xuXG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHRmcmFtZS5vcGVuKCk7XG5cblx0fSxcblxuXHQvKipcblx0ICogQWRkIGEgZmlsdGVyIHRvIHRoZSBmcmFtZSBsaWJyYXJ5IGNvbGxlY3Rpb24gdG8gbGltaXQgdG8gcmVxdWlyZWQgc2l6ZS5cblx0ICogQHJldHVybiBudWxsXG5cdCAqL1xuXHRzZXR1cEZpbHRlcnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGxpYiAgICA9IHRoaXMuZnJhbWUuc3RhdGUoKS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggJ3NpemVSZXEnIGluIHRoaXMuY29uZmlnICkge1xuXHRcdFx0bGliLmZpbHRlcnMuc2l6ZSA9IHRoaXMuaXNBdHRhY2htZW50U2l6ZU9rO1xuXHRcdH1cblxuXHR9LFxuXG5cdHJlbW92ZUltYWdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgJHRhcmdldCwgaWQ7XG5cblx0XHQkdGFyZ2V0ICAgPSAkKGUudGFyZ2V0KTtcblx0XHQkdGFyZ2V0ICAgPSAoICR0YXJnZXQucHJvcCgndGFnTmFtZScpID09PSAnQlVUVE9OJyApID8gJHRhcmdldCA6ICR0YXJnZXQuY2xvc2VzdCgnYnV0dG9uLnJlbW92ZScpO1xuXHRcdGlkICAgICAgICA9ICR0YXJnZXQuZGF0YSggJ2ltYWdlLWlkJyApO1xuXG5cdFx0aWYgKCAhIGlkICApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnZhbHVlID0gXy5maWx0ZXIoIHRoaXMudmFsdWUsIGZ1bmN0aW9uKCB2YWwgKSB7XG5cdFx0XHRyZXR1cm4gKCB2YWwgIT09IGlkICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy52YWx1ZSA9ICggdGhpcy52YWx1ZS5sZW5ndGggPiAwICkgPyB0aGlzLnZhbHVlIDogW107XG5cblx0XHQvLyBVcGRhdGUgc2VsZWN0aW9uLlxuXHRcdHZhciByZW1vdmUgPSB0aGlzLnNlbGVjdGlvbi5maWx0ZXIoIGZ1bmN0aW9uKCBpdGVtICkge1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsdWUuaW5kZXhPZiggaXRlbS5nZXQoJ2lkJykgKSA8IDA7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0XHR0aGlzLnNlbGVjdGlvbi5yZW1vdmUoIHJlbW92ZSApO1xuXG5cdFx0dGhpcy50cmlnZ2VyKCAnY2hhbmdlJywgdGhpcy52YWx1ZSApO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIERvZXMgYXR0YWNobWVudCBtZWV0IHNpemUgcmVxdWlyZW1lbnRzP1xuXHQgKlxuXHQgKiBAcGFyYW0gIEF0dGFjaG1lbnRcblx0ICogQHJldHVybiBib29sZWFuXG5cdCAqL1xuXHRpc0F0dGFjaG1lbnRTaXplT2s6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXG5cdFx0aWYgKCAhICggJ3NpemVSZXEnIGluIHRoaXMuY29uZmlnICkgKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLmNvbmZpZy5zaXplUmVxID0gXy5leHRlbmQoIHtcblx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0aGVpZ2h0OiAwLFxuXHRcdH0sIHRoaXMuY29uZmlnLnNpemVSZXEgKTtcblxuXHRcdHZhciB3aWR0aFJlcSAgPSBhdHRhY2htZW50LmdldCgnd2lkdGgnKSAgPj0gdGhpcy5jb25maWcuc2l6ZVJlcS53aWR0aDtcblx0XHR2YXIgaGVpZ2h0UmVxID0gYXR0YWNobWVudC5nZXQoJ2hlaWdodCcpID49IHRoaXMuY29uZmlnLnNpemVSZXEuaGVpZ2h0O1xuXG5cdFx0cmV0dXJuIHdpZHRoUmVxICYmIGhlaWdodFJlcTtcblxuXHR9XG5cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZEltYWdlO1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LWJsb2NrcXVvdGUnICkuaHRtbCgpLFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGlnaGxpZ2h0TW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICQoICcjdG1wbC11c3R3by1tb2R1bGUtZWRpdC1jYXNlLXN0dWRpZXMnICkuaHRtbCgpLFxuXHRjYXNlU3R1ZHlBdHRyOiBudWxsLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMgKTtcblx0XHR0aGlzLmNhc2VTdHVkeUF0dHIgPSB0aGlzLm1vZGVsLmdldCgnYXR0cicpLmZpbmRXaGVyZSggeyBuYW1lOiAnY2FzZV9zdHVkaWVzJyB9KTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMgKTtcblx0XHR0aGlzLmluaXRTZWxlY3QyKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0aW5pdFNlbGVjdDI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyICRmaWVsZCA9ICQoICdbZGF0YS1tb2R1bGUtYXR0ci1uYW1lPWNhc2Vfc3R1ZGllc10nLCB0aGlzLiRlbCApO1xuXHRcdHZhciB2YWx1ZXMgPSB0aGlzLmNhc2VTdHVkeUF0dHIuZ2V0KCd2YWx1ZScpO1xuXG5cdFx0JC5hamF4KCAnL3dwLWpzb24vdXN0d28vdjEvY2FzZS1zdHVkaWVzLycpLmRvbmUoIGZ1bmN0aW9uKCBkYXRhICkge1xuXG5cdFx0XHRkYXRhID0gXy5tYXAoIGRhdGEsIGZ1bmN0aW9uKCBpdGVtICkge1xuXHRcdFx0XHRyZXR1cm4geyBpZDogaXRlbS5zbHVnLCB0ZXh0OiBpdGVtLm5hbWUgfTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkZmllbGQuc2VsZWN0Migge1xuXHRcdFx0XHRhbGxvd0NsZWFyOiB0cnVlLFxuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRtdWx0aXBsZTogdHJ1ZSxcblx0XHRcdH0gKS5zZWxlY3QyKCAndmFsJywgdmFsdWVzLnNwbGl0KCAnLCcgKSApO1xuXG5cdFx0fSApO1xuXG5cdH0sXG5cblx0cmVtb3ZlTW9kZWw6IGZ1bmN0aW9uKGUpIHtcblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5yZW1vdmVNb2RlbC5hcHBseSggdGhpcywgW2VdICk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgRmllbGRJbWFnZSA9IHJlcXVpcmUoJy4vZmllbGQtaW1hZ2UuanMnKTtcblxuLyoqXG4gKiBIZWFkZXIgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUgd2l0aCBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgR3JpZENlbGxNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LWdyaWQtY2VsbCcgKS5odG1sKCksXG5cdGltYWdlRmllbGQ6IG51bGwsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0dmFyIGltYWdlQXR0ciA9IHRoaXMubW9kZWwuZ2V0QXR0cignaW1hZ2UnKTtcblxuXHRcdHRoaXMuaW1hZ2VGaWVsZCA9IG5ldyBGaWVsZEltYWdlKCB7XG5cdFx0XHR2YWx1ZTogaW1hZ2VBdHRyLmdldCgndmFsdWUnKSxcblx0XHRcdGNvbmZpZzogaW1hZ2VBdHRyLmdldCgnY29uZmlnJykgfHwge30sXG5cdFx0fSApO1xuXG5cdFx0dGhpcy5pbWFnZUZpZWxkLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRpbWFnZUF0dHIuc2V0KCAndmFsdWUnLCBkYXRhICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcyApO1xuXG5cdFx0JCggJy5pbWFnZS1maWVsZCcsIHRoaXMuJGVsICkuYXBwZW5kKFxuXHRcdFx0dGhpcy5pbWFnZUZpZWxkLnJlbmRlcigpLiRlbFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkQ2VsbE1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBNb2R1bGVFZGl0ICA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBCdWlsZGVyICAgICA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2J1aWxkZXIuanMnKTtcbnZhciBGaWVsZEltYWdlICA9IHJlcXVpcmUoJy4vZmllbGQtaW1hZ2UuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgR3JpZE1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtdXN0d28tbW9kdWxlLWVkaXQtZ3JpZCcgKS5odG1sKCksXG5cblx0aW1hZ2VGaWVsZDogbnVsbCxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcblxuXHRcdE1vZHVsZUVkaXQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIFsgYXR0cmlidXRlcywgb3B0aW9ucyBdICk7XG5cblx0XHR2YXIgaW1hZ2VBdHRyID0gdGhpcy5tb2RlbC5nZXRBdHRyKCdncmlkX2ltYWdlJyk7XG5cblx0XHR0aGlzLmltYWdlRmllbGQgPSBuZXcgRmllbGRJbWFnZSgge1xuXHRcdFx0dmFsdWU6ICBpbWFnZUF0dHIuZ2V0KCd2YWx1ZScpLFxuXHRcdFx0Y29uZmlnOiBpbWFnZUF0dHIuZ2V0KCdjb25maWcnKSB8fCB7fSxcblx0XHR9ICk7XG5cblx0XHR0aGlzLmltYWdlRmllbGQub24oICdjaGFuZ2UnLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdGltYWdlQXR0ci5zZXQoICd2YWx1ZScsIGRhdGEgKTtcblx0XHRcdHRoaXMubW9kZWwudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMubW9kZWwgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLm1vZGVsLnNldCggJ2NpZCcsIHRoaXMubW9kZWwuY2lkICk7XG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHR0aGlzLnJlbmRlckJ1aWxkZXIoKTtcblx0XHR0aGlzLnJlbmRlckltYWdlKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHJlbmRlckJ1aWxkZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGJ1aWxkZXIgPSBuZXcgQnVpbGRlcih7XG5cdFx0XHRpZDogJ2dyaWQtYnVpbGRlci0nICsgdGhpcy5tb2RlbC5jaWQsXG5cdFx0XHRhbGxvd2VkTW9kdWxlczogWyAnZ3JpZF9jZWxsJyBdLFxuXHRcdH0pO1xuXG5cdFx0Ly8gUmVxdWlyZSBCdWlsZGVyVmlldy4gTm90ZSAtIGRvIGl0IGFmdGVyIHJ1bnRpbWUgdG8gYXZvaWQgbG9vcC5cblx0XHR2YXIgQnVpbGRlclZpZXcgPSByZXF1aXJlKCcuL2J1aWxkZXIuanMnKTtcblx0XHR2YXIgYnVpbGRlclZpZXcgPSBuZXcgQnVpbGRlclZpZXcoIHsgbW9kZWw6IGJ1aWxkZXIgfSApO1xuXG5cdFx0JCggJy5idWlsZGVyJywgdGhpcy4kZWwgKS5hcHBlbmQoIGJ1aWxkZXJWaWV3LnJlbmRlcigpLiRlbCApO1xuXG5cdFx0Ly8gT24gc2F2ZSwgdXBkYXRlIGF0dHJpYnV0ZSB3aXRoIGJ1aWxkZXIgZGF0YS5cblx0XHQvLyBNYW51YWxseSB0cmlnZ2VyIGNoYW5nZSBldmVudC5cblx0XHRidWlsZGVyLm9uKCAnc2F2ZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0dGhpcy5tb2RlbC5nZXRBdHRyKCAnZ3JpZF9jZWxscycgKS5zZXQoICd2YWx1ZScsIGRhdGEgKTtcblx0XHRcdHRoaXMubW9kZWwudHJpZ2dlciggJ2NoYW5nZScsIHRoaXMubW9kZWwgKTtcblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdC8vIEluaXRhbGl6ZSBkYXRhLlxuXHRcdHZhciBhdHRyTW9kZWwgPSB0aGlzLm1vZGVsLmdldEF0dHIoICdncmlkX2NlbGxzJyApO1xuXG5cdFx0aWYgKCBhdHRyTW9kZWwgKSB7XG5cdFx0XHRidWlsZGVyLnNldERhdGEoIGF0dHJNb2RlbC5nZXQoICd2YWx1ZScpICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0cmVuZGVySW1hZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0JCggJz4gLnNlbGVjdGlvbi1pdGVtID4gLmZvcm0tcm93ID4gLmltYWdlLWZpZWxkJywgdGhpcy4kZWwgKS5hcHBlbmQoXG5cdFx0XHR0aGlzLmltYWdlRmllbGQucmVuZGVyKCkuJGVsXG5cdFx0KTtcblxuXHR9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkTW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIZWFkZXIgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUgd2l0aCBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSGVhZGVyTW9kdWxlRWRpdFZpZXcgPSBNb2R1bGVFZGl0LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtdXN0d28tbW9kdWxlLWVkaXQtaGVhZGVyJyApLmh0bWwoKSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlck1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG52YXIgRmllbGRJbWFnZSA9IHJlcXVpcmUoJy4vZmllbGQtaW1hZ2UuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgSW1hZ2VNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LWltYWdlLWxvZ28taGVhZGxpbmUnICkuaHRtbCgpLFxuXHRpbWFnZUZpZWxkOiBudWxsLFxuXHRpbWFnZUF0dHI6IG51bGwsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0dGhpcy5pbWFnZUF0dHIgPSB0aGlzLm1vZGVsLmdldEF0dHIoJ2ltYWdlJyk7XG5cblx0XHR2YXIgY29uZmlnID0gdGhpcy5pbWFnZUF0dHIuZ2V0KCdjb25maWcnKSB8fCB7fTtcblxuXHRcdGNvbmZpZyA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0fSwgY29uZmlnICk7XG5cblx0XHR0aGlzLmltYWdlRmllbGQgPSBuZXcgRmllbGRJbWFnZSgge1xuXHRcdFx0dmFsdWU6IHRoaXMuaW1hZ2VBdHRyLmdldCgndmFsdWUnKSxcblx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuaW1hZ2VGaWVsZC5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0dGhpcy5pbWFnZUF0dHIuc2V0KCAndmFsdWUnLCBkYXRhICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHQkKCAnLmltYWdlLWZpZWxkJywgdGhpcy4kZWwgKS5hcHBlbmQoXG5cdFx0XHR0aGlzLmltYWdlRmllbGQucmVuZGVyKCkuJGVsXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlTW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcbnZhciBGaWVsZEltYWdlID0gcmVxdWlyZSgnLi9maWVsZC1pbWFnZS5qcycpO1xuXG4vKipcbiAqIEhpZ2hsaWdodCBNb2R1bGUuXG4gKiBFeHRlbmRzIGRlZmF1bHQgbW91ZHVsZSxcbiAqIGN1c3RvbSBkaWZmZXJlbnQgdGVtcGxhdGUuXG4gKi9cbnZhciBJbWFnZU1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtdXN0d28tbW9kdWxlLWVkaXQtaW1hZ2UnICkuaHRtbCgpLFxuXHRpbWFnZUZpZWxkOiBudWxsLFxuXHRpbWFnZUF0dHI6IG51bGwsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBbIGF0dHJpYnV0ZXMsIG9wdGlvbnMgXSApO1xuXG5cdFx0dGhpcy5pbWFnZUF0dHIgPSB0aGlzLm1vZGVsLmdldEF0dHIoJ2ltYWdlJyk7XG5cblx0XHR2YXIgY29uZmlnID0gdGhpcy5pbWFnZUF0dHIuZ2V0KCdjb25maWcnKSB8fCB7fTtcblxuXHRcdGNvbmZpZyA9IF8uZXh0ZW5kKCB7XG5cdFx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0fSwgY29uZmlnICk7XG5cblx0XHR0aGlzLmltYWdlRmllbGQgPSBuZXcgRmllbGRJbWFnZSgge1xuXHRcdFx0dmFsdWU6IHRoaXMuaW1hZ2VBdHRyLmdldCgndmFsdWUnKSxcblx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdH0gKTtcblxuXHRcdHRoaXMuaW1hZ2VGaWVsZC5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0dGhpcy5pbWFnZUF0dHIuc2V0KCAndmFsdWUnLCBkYXRhICk7XG5cdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cdFx0fS5iaW5kKHRoaXMpICk7XG5cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHQkKCAnLmltYWdlLWZpZWxkJywgdGhpcy4kZWwgKS5hcHBlbmQoXG5cdFx0XHR0aGlzLmltYWdlRmllbGQucmVuZGVyKCkuJGVsXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlTW9kdWxlRWRpdFZpZXc7XG4iLCJ2YXIgJCAgICAgICAgICA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgTW9kdWxlRWRpdCA9IHJlcXVpcmUoJy4vbW9kdWxlLWVkaXQuanMnKTtcblxuLyoqXG4gKiBIaWdobGlnaHQgTW9kdWxlLlxuICogRXh0ZW5kcyBkZWZhdWx0IG1vdWR1bGUsXG4gKiBjdXN0b20gZGlmZmVyZW50IHRlbXBsYXRlLlxuICovXG52YXIgU3RhdHNNb2R1bGVFZGl0VmlldyA9IE1vZHVsZUVkaXQuZXh0ZW5kKHtcblx0dGVtcGxhdGU6ICQoICcjdG1wbC11c3R3by1tb2R1bGUtZWRpdC1zdGF0cycgKS5odG1sKCksXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0c01vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAkKCAnI3RtcGwtdXN0d28tbW9kdWxlLWVkaXQtdGV4dCcgKS5odG1sKCksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRNb2R1bGVFZGl0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzICk7XG5cblx0XHQvLyBNYWtlIHN1cmUgdGhlIHRlbXBsYXRlIGZvciB0aGlzIG1vZHVsZSBpcyB1bmlxdWUgdG8gdGhpcyBpbnN0YW5jZS5cblx0XHR0aGlzLmVkaXRvciA9IHtcblx0XHRcdGlkICAgICAgICAgICA6ICd1c3R3by10ZXh0LWJvZHktJyArIHRoaXMubW9kZWwuY2lkLFxuXHRcdFx0bmFtZVJlZ2V4ICAgIDogbmV3IFJlZ0V4cCggJ3VzdHdvLXBsYWNlaG9sZGVyLW5hbWUnLCAnZycgKSxcblx0XHRcdGlkUmVnZXggICAgICA6IG5ldyBSZWdFeHAoICd1c3R3by1wbGFjZWhvbGRlci1pZCcsICdnJyApLFxuXHRcdFx0Y29udGVudFJlZ2V4IDogbmV3IFJlZ0V4cCggJ3VzdHdvLXBsYWNlaG9sZGVyLWNvbnRlbnQnLCAnZycgKSxcblx0XHR9O1xuXG5cdFx0dGhpcy50ZW1wbGF0ZSAgPSB0aGlzLnRlbXBsYXRlLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuaWRSZWdleCwgdGhpcy5lZGl0b3IuaWQgKTtcblx0XHR0aGlzLnRlbXBsYXRlICA9IHRoaXMudGVtcGxhdGUucmVwbGFjZSggdGhpcy5lZGl0b3IuY29udGVudFJlZ2V4LCAnPCU9IGF0dHIuYm9keS52YWx1ZSAlPicgKTtcblxuXHRcdHRoaXMudGVzdCA9IHRoaXMubW9kZWwuY2lkO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzICk7XG5cblx0XHQvLyBQcmV2ZW50IEZPVUMuIFNob3cgYWdhaW4gb24gaW5pdC4gU2VlIHNldHVwLlxuXHRcdCQoICcud3AtZWRpdG9yLXdyYXAnLCB0aGlzLiRlbCApLmNzcyggJ2Rpc3BsYXknLCAnbm9uZScgKTtcblxuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuaW5pdFRpbnlNQ0UoKTtcblx0XHR9LmJpbmQoIHRoaXMgKSwgMTAwICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBUaW55TUNFIGVkaXRvci5cblx0ICpcblx0ICogQHJldHVybiBudWxsLlxuXHQgKi9cblx0aW5pdFRpbnlNQ0U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHNlbGYgPSB0aGlzLCBpZCwgZWQsICRlbCwgcHJvcDtcblxuXHRcdGlkICA9IHRoaXMuZWRpdG9yLmlkO1xuXHRcdGVkICA9IHRpbnlNQ0UuZ2V0KCBpZCApO1xuXHRcdCRlbCA9ICQoICcjd3AtJyArIGlkICsgJy13cmFwJywgdGhpcy4kZWwgKTtcblxuXHRcdGlmICggZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSWYgbm8gc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuIENsb25lIGZyb20gcGxhY2Vob2xkZXIuXG5cdFx0aWYgKCB0eXBlb2YoIHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0gKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR2YXIgbmV3U2V0dGluZ3MgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgdGlueU1DRVByZUluaXQubWNlSW5pdFsgJ3VzdHdvLXBsYWNlaG9sZGVyLWlkJyBdICk7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG5ld1NldHRpbmdzICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1NldHRpbmdzW3Byb3BdICkgKSB7XG5cdFx0XHRcdFx0bmV3U2V0dGluZ3NbcHJvcF0gPSBuZXdTZXR0aW5nc1twcm9wXS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCBpZCApLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgbmFtZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5tY2VJbml0WyBpZCBdID0gbmV3U2V0dGluZ3M7XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGZ1bGxzY3JlZW4gcGx1Z2luLlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucyA9IHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbIGlkIF0ucGx1Z2lucy5yZXBsYWNlKCAnZnVsbHNjcmVlbiwnLCAnJyApO1xuXG5cdFx0Ly8gSWYgbm8gUXVpY2t0YWcgc2V0dGluZ3MgZm9yIHRoaXMgZmllbGQuIENsb25lIGZyb20gcGxhY2Vob2xkZXIuXG5cdFx0aWYgKCB0eXBlb2YoIHRpbnlNQ0VQcmVJbml0LnF0SW5pdFsgaWQgXSApID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdHZhciBuZXdRVFMgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgdGlueU1DRVByZUluaXQucXRJbml0WyAndXN0d28tcGxhY2Vob2xkZXItaWQnIF0gKTtcblx0XHRcdGZvciAoIHByb3AgaW4gbmV3UVRTICkge1xuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YoIG5ld1FUU1twcm9wXSApICkge1xuXHRcdFx0XHRcdG5ld1FUU1twcm9wXSA9IG5ld1FUU1twcm9wXS5yZXBsYWNlKCB0aGlzLmVkaXRvci5pZFJlZ2V4LCBpZCApLnJlcGxhY2UoIHRoaXMuZWRpdG9yLm5hbWVSZWdleCwgbmFtZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aW55TUNFUHJlSW5pdC5xdEluaXRbIGlkIF0gPSBuZXdRVFM7XG5cdFx0fVxuXG5cdFx0dmFyIG1vZGUgPSAkZWwuaGFzQ2xhc3MoJ3RtY2UtYWN0aXZlJykgPyAndG1jZScgOiAnaHRtbCc7XG5cblx0XHQvLyBXaGVuIGVkaXRvciBpbml0cywgYXR0YWNoIHNhdmUgY2FsbGJhY2sgdG8gY2hhbmdlIGV2ZW50LlxuXHRcdHRpbnlNQ0VQcmVJbml0Lm1jZUluaXRbaWRdLnNldHVwID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0c2VsZi5zZXRBdHRyKCAnYm9keScsIGUudGFyZ2V0LmdldENvbnRlbnQoKSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHR0aGlzLm9uKCAnaW5pdCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0JGVsLmNzcyggJ2Rpc3BsYXknLCAnYmxvY2snICk7XG5cdFx0XHRcdH0sIDEwMCApO1xuXHRcdFx0fSk7XG5cblx0XHR9O1xuXG5cdFx0Ly8gSWYgY3VycmVudCBtb2RlIGlzIHZpc3VhbCwgY3JlYXRlIHRoZSB0aW55TUNFLlxuXHRcdGlmICggJ3RtY2UnID09PSBtb2RlICkge1xuXHRcdFx0dGlueU1DRS5pbml0KCB0aW55TUNFUHJlSW5pdC5tY2VJbml0W2lkXSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkZWwuY3NzKCAnZGlzcGxheScsICdibG9jaycgKTtcblx0XHR9XG5cblx0XHQvLyBJbml0IHF1aWNrdGFncy5cblx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdHF1aWNrdGFncyggdGlueU1DRVByZUluaXQucXRJbml0WyBpZCBdICk7XG5cdFx0XHRRVGFncy5fYnV0dG9uc0luaXQoKTtcblx0XHR9LCAxMDAgKTtcblxuXHRcdC8vIEhhbmRsZSB0ZW1wb3JhcmlseSByZW1vdmUgdGlueU1DRSB3aGVuIHNvcnRpbmcuXG5cdFx0dGhpcy4kZWwuY2xvc2VzdCgnLnVpLXNvcnRhYmxlJykub24oICdzb3J0c3RhcnQnLCBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0aWYgKCB1aS5pdGVtWzBdLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSA9PT0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2lkJykgKSB7XG5cdFx0XHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgaWQgKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHRcdC8vIEhhbmRsZSByZS1pbml0IGFmdGVyIHNvcnRpbmcuXG5cdFx0dGhpcy4kZWwuY2xvc2VzdCgnLnVpLXNvcnRhYmxlJykub24oICdzb3J0c3RvcCcsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRpZiAoIHVpLml0ZW1bMF0uZ2V0QXR0cmlidXRlKCdkYXRhLWNpZCcpID09PSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jaWQnKSApIHtcblx0XHRcdFx0dGlueU1DRS5leGVjQ29tbWFuZCgnbWNlQWRkRWRpdG9yJywgZmFsc2UsIGlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykgKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgbW9kZWwgaGFuZGxlci5cblx0ICovXG5cdHJlbW92ZU1vZGVsOiBmdW5jdGlvbihlKSB7XG5cdFx0TW9kdWxlRWRpdC5wcm90b3R5cGUucmVtb3ZlTW9kZWwuYXBwbHkoIHRoaXMsIFtlXSApO1xuXHRcdHRpbnlNQ0UuZXhlY0NvbW1hbmQoICdtY2VSZW1vdmVFZGl0b3InLCBmYWxzZSwgdGhpcy5lZGl0b3IuaWQgKTtcblx0fSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG5cbi8qKlxuICogSGVhZGVyIE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlIHdpdGggY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhlYWRlck1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LXRleHRhcmVhJyApLmh0bWwoKSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlck1vZHVsZUVkaXRWaWV3O1xuIiwidmFyICQgICAgICAgICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIE1vZHVsZUVkaXQgPSByZXF1aXJlKCcuL21vZHVsZS1lZGl0LmpzJyk7XG5cbi8qKlxuICogSGlnaGxpZ2h0IE1vZHVsZS5cbiAqIEV4dGVuZHMgZGVmYXVsdCBtb3VkdWxlLFxuICogY3VzdG9tIGRpZmZlcmVudCB0ZW1wbGF0ZS5cbiAqL1xudmFyIEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3ID0gTW9kdWxlRWRpdC5leHRlbmQoe1xuXHR0ZW1wbGF0ZTogJCggJyN0bXBsLXVzdHdvLW1vZHVsZS1lZGl0LXZpZGVvJyApLmh0bWwoKSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hsaWdodE1vZHVsZUVkaXRWaWV3O1xuIiwidmFyIEJhY2tib25lICAgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciAkICAgICAgICAgID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIE1vZHVsZUVkaXQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0Y2xhc3NOYW1lOiAgICAgJ21vZHVsZS1lZGl0Jyxcblx0dG9vbHNUZW1wbGF0ZTogJCgnI3RtcGwtdXN0d28tbW9kdWxlLWVkaXQtdG9vbHMnICkuaHRtbCgpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgKltkYXRhLW1vZHVsZS1hdHRyLW5hbWVdJzogJ2F0dHJGaWVsZENoYW5nZWQnLFxuXHRcdCdrZXl1cCAgKltkYXRhLW1vZHVsZS1hdHRyLW5hbWVdJzogJ2F0dHJGaWVsZENoYW5nZWQnLFxuXHRcdCdpbnB1dCAgKltkYXRhLW1vZHVsZS1hdHRyLW5hbWVdJzogJ2F0dHJGaWVsZENoYW5nZWQnLFxuXHRcdCdjbGljayAgLmJ1dHRvbi1zZWxlY3Rpb24taXRlbS1yZW1vdmUnOiAncmVtb3ZlTW9kZWwnLFxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdF8uYmluZEFsbCggdGhpcywgJ2F0dHJGaWVsZENoYW5nZWQnLCAncmVtb3ZlTW9kZWwnLCAnc2V0QXR0cicgKTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGRhdGEgID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0XHRkYXRhLmF0dHIgPSB7fTtcblxuXHRcdC8vIEZvcm1hdCBhdHRyaWJ1dGUgYXJyYXkgZm9yIGVhc3kgdGVtcGxhdGluZy5cblx0XHQvLyBCZWNhdXNlIGF0dHJpYnV0ZXMgaW4gIGFycmF5IGlzIGRpZmZpY3VsdCB0byBhY2Nlc3MuXG5cdFx0dGhpcy5tb2RlbC5nZXQoJ2F0dHInKS5lYWNoKCBmdW5jdGlvbiggYXR0ciApIHtcblx0XHRcdGRhdGEuYXR0clsgYXR0ci5nZXQoJ25hbWUnKSBdID0gYXR0ci50b0pTT04oKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRlbC5odG1sKCBfLnRlbXBsYXRlKCB0aGlzLnRlbXBsYXRlLCBkYXRhICkgKTtcblxuXHRcdHRoaXMuaW5pdGlhbGl6ZUNvbG9ycGlja2VyKCk7XG5cblx0XHQvLyBJRCBhdHRyaWJ1dGUsIHNvIHdlIGNhbiBjb25uZWN0IHRoZSB2aWV3IGFuZCBtb2RlbCBhZ2FpbiBsYXRlci5cblx0XHR0aGlzLiRlbC5hdHRyKCAnZGF0YS1jaWQnLCB0aGlzLm1vZGVsLmNpZCApO1xuXG5cdFx0Ly8gQXBwZW5kIHRoZSBtb2R1bGUgdG9vbHMuXG5cdFx0dGhpcy4kZWwucHJlcGVuZCggXy50ZW1wbGF0ZSggdGhpcy50b29sc1RlbXBsYXRlLCBkYXRhICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0aW5pdGlhbGl6ZUNvbG9ycGlja2VyOiBmdW5jdGlvbigpIHtcblx0XHQkKCcudXN0d28tcGItY29sb3ItcGlja2VyJywgdGhpcy4kZWwgKS53cENvbG9yUGlja2VyKHtcblx0XHQgICAgcGFsZXR0ZXM6IFsnI2VkMDA4MicsICcjZTYwYzI5JywnI2ZmNTUxOScsJyNmZmJmMDAnLCcjOTZjYzI5JywnIzE0YzA0ZCcsJyMxNmQ1ZDknLCcjMDA5Y2YzJywnIzE0M2ZjYycsJyM2MTE0Y2MnLCcjMzMzMzMzJ10sXG5cdFx0XHRjaGFuZ2U6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRcdCQodGhpcykuYXR0ciggJ3ZhbHVlJywgdWkuY29sb3IudG9TdHJpbmcoKSApO1xuXHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0c2V0QXR0cjogZnVuY3Rpb24oIGF0dHJpYnV0ZSwgdmFsdWUgKSB7XG5cblx0XHR2YXIgYXR0ciA9IHRoaXMubW9kZWwuZ2V0KCAnYXR0cicgKS5maW5kV2hlcmUoIHsgbmFtZTogYXR0cmlidXRlIH0gKTtcblxuXHRcdGlmICggYXR0ciApIHtcblx0XHRcdGF0dHIuc2V0KCAndmFsdWUnLCB2YWx1ZSApO1xuXHRcdFx0dGhpcy5tb2RlbC50cmlnZ2VyKCdjaGFuZ2U6YXR0cicpO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGFuZ2UgZXZlbnQgaGFuZGxlci5cblx0ICogVXBkYXRlIGF0dHJpYnV0ZSBmb2xsb3dpbmcgdmFsdWUgY2hhbmdlLlxuXHQgKi9cblx0YXR0ckZpZWxkQ2hhbmdlZDogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIGF0dHIgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoICdkYXRhLW1vZHVsZS1hdHRyLW5hbWUnICk7XG5cbiAgICAgICAgaWYgKCBlLnRhcmdldC5oYXNBdHRyaWJ1dGUoICdjb250ZW50ZWRpdGFibGUnICkgKSB7XG4gICAgICAgIFx0dGhpcy5zZXRBdHRyKCBhdHRyLCAkKGUudGFyZ2V0KS5odG1sKCkgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgXHR0aGlzLnNldEF0dHIoIGF0dHIsIGUudGFyZ2V0LnZhbHVlICk7XG4gICAgICAgIH1cblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgbW9kZWwgaGFuZGxlci5cblx0ICovXG5cdHJlbW92ZU1vZGVsOiBmdW5jdGlvbihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMucmVtb3ZlKCk7XG5cdFx0dGhpcy5tb2RlbC5kZXN0cm95KCk7XG5cdH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZUVkaXQ7XG4iXX0=

var Boxes = $A();

var BoxBuilder = Class.create(HomeMarksApp,{
  
  initialize: function($super,columnObj,id) { 
    $super();
    this.build(columnObj,id);
  },
  
  build: function(columnObj,id) {
    var boxId = 'box_'+ id;
    var sortable = columnObj.column;
    var boxHTML = DIV({id:boxId,className:'dragable_boxes',style:'display:none;'},[
      DIV({className:'box'},[
        DIV({className:'box_header clearfix'},[
          SPAN({className:'box_action'}),
          SPAN({className:'box_title'},[
            SPAN({className:'box_handle'}),
            SPAN({className:'box_titletext'},'Rename Me...')
          ])
        ]),
        DIV({className:'line'}),
        DIV({className:'inside'},[
          UL({className:'sortablelist'})
        ])
      ])
    ]);
    columnObj.controls.insert({after:boxHTML});
    var box = sortable.down('div.dragable_boxes');
    var boxObject = new Box(box);
    Boxes.push(boxObject);
    boxObject.insertControlsHTML(true);
    box.blindDown({duration:0.35});
    SortableUtils.createSortableMember(sortable,box);
  }
  
});

var Box = Class.create(HomeMarksApp,{
  
  initialize: function($super,box) {
    this.box = $(box);
    this.sortable = this.box.up('div.dragable_columns')
    this.header = this.box.down('div.box_header');
    this.insides = this.box.down('div.inside');
    this.controls = this.insides.down('div.box_controls');
    this.list = this.insides.down('ul.sortablelist');
    this.id = parseInt(this.box.id.sub('box_',''));
    $super();
    this._initBoxEvents();
  },
  
  toggleActions: function(event) {
    // When showing:
    // this.actions.addClassName('box_action_down');
    // When hiding:
    // this.actions.removeClassName('box_action_down');
  },
  
  editLinks: function(event) {
    
  },
  
  changeColor: function() {
    // $('boxid_#{box.id}_style').classNames().set('box #{swatch}')
  },
  
  insertControlsHTML: function(display) {
    this.insides.insert({top:this._controlsHTML(display)});
  },
  
  
  completeToggleCollapse: function(request) {
    var shown = request.responseJSON;
    /* If shown */
    // page.blind_box_parts(@box,'inside',:down)
    // page.replace "boxid_#{@box.id}_action_lame", link_to_remote_for_box_actions(@box,'down')
    // page.make_msg('good','Box uncollapsed.')
    /* If hidden */
    // page.blind_box_parts(@box,'inside',:up)
    // page.select("div#boxid_#{@box.id}_controls").each { |div| page.delay(0.5){div.remove} }
    // page.replace "boxid_#{@box.id}_action_lame", link_to_remote_for_box_actions(@box,'down')
    // page.make_msg('good','Box collapsed.')
  },
  
  _controlsHTML: function(display) {
    var displayStyle = (display) ? 'block' : 'none';
    var controlContent = [ SPAN({className:'box_delete'}), SPAN({className:'box_edit'}) ];
    Box.colors.each(function(color){ controlContent.push(SPAN({className:'box_swatch swatch_'+color})); });
    controlContent.push(INPUT({className:'box_input',type:'text',value:'Rename Me...',maxlength:'64'}));
    return DIV({className:'box_controls clearfix',style:'display:'+displayStyle},controlContent);
  },
  
  _buildBoxSortables: function() {
    if (!Boxes.sorted) { Boxes.sorted = $H() };
    if (!Boxes.sorted[this.sortable.id]) {
      this.sortable.action = '/boxes/sort';
      this.sortable.parameters = this.columnSortParams;
      this.sortable.method = 'put';
      Sortable.create(this.sortable, {
        handle:       'box_handle', 
        tag:          'div', 
        only:         'dragable_boxes', 
        accept:       'dragable_boxes',
        hoverclass:   'column_hover',
        containment:  this.sortable.id, // :containment => current_user.column_containment_array,
        constraint:   false, 
        dropOnEmpty:  true, 
        onUpdate: this.startAjaxRequest.bindAsEventListener(this,this.completeColumnSort), 
      });
      Boxes.sorted[this.sortable.id] = true;
    };
  },
  
  // LOADING A LAME SPAN (for toggle actions and toggle insides)
  // if (direction == 'down') { spanclass = 'box_action box_action_down' }
  // if (direction == 'up') { spanclass = 'box_action' }
  // Element.replace('boxid_'+boxid+'_action_alink', '<span class="'+spanclass+'" id="boxid_'+boxid+'_action_lame"></span>')
  
  _initToggleCollapse: function() {
    this.title = this.header.down('span.box_titletext');
    this.title.action = '/boxes/' + this.id + '/toggle_collapse';
    this.title.method = 'put';
    this.createAjaxObserver(this.title,this.completeToggleCollapse);
  },
  
  _initAllControls: function() {
    /* Destroy Box */
    // this.destroyBox = this.controls.down('span.box_delete');
    // this.destroyBox.confirmation = 'Are you sure? Deleting a BOX will also delete all the bookmarks within it.';
    // this.destroyBox.action = '/boxes/' + this.id;
    // this.destroyBox.method = 'delete';
    // this.createAjaxObserver(this.destroyCtl,this.completeDestroyColumn);
    /* Edit Box */
    // this.editBox = this.controls.down('span.box_edit');
    /* Update Title */
    // observe_field
    // "boxid_#{box.id}_input_title",
    // :frequency => 0.4, 
    // :update => "boxid_#{box.id}_title", 
    // :url => change_title_url(:id => box.id), 
    // :with => "'title='+escape(value)"
  },
  
  _initPrefActions: function() {
     this.actions = this.header.down('span.box_action');
  },
  
  _initBoxEvents: function() {
    this._buildBoxSortables();
    this._initToggleCollapse();
    // this._initAllControls();
    // this._initPrefActions();
  }
  
});


Box.colors = $A([ 
  'white',      'aqua',     'melon',  'limeade',      'lavender', 'postit', 'bisque',
  'timberwolf', 'sky_blue', 'salmon', 'spring_green', 'wistera',  'yellow', 'apricot',
  'black',      'cerulian', 'red',    'yellow_green', 'violet',   'orange', 'raw_sienna' 
]);


document.observe('dom:loaded', function(){
  $$('div.dragable_boxes').each(function(box){ 
    var boxObject = new Box(box);
    Boxes.push(boxObject);
  });
});




class BoxesController < ApplicationController  
  
  prepend_before_filter :ignore_lost_sortable_requests
  before_filter         :find_box, :except => :create
  # TODO [DEMO] Controller filters
  # after_filter :expire_user_home_cache, :except => [ :actions_down, :actions_up ]
  # after_filter :expire_action_boxes, :only => [ :new ]
  
  
  def create
    @box = current_user.columns.find(params[:column_id]).boxes.create!
    render_json_data(@box.id)
  end
  
  def destroy
    @box.destroy
    head :ok
  end
  
  def colorize
    @box.update_attributes! :style => params[:color]
    head :ok
  end
  
  def change_title
    @box.update_attributes! :title => params[:title]
    render_json_data(@box.title)
  end
  
  def toggle_collapse
    @box.toggle(:collapsed).save!
    render_json_data(@box.collapsed?)
  end
  
  def sort
    if internal_sort?
      @box.insert_at(params[:position])
    else
      @column = current_user.columns.find(params[:gained_id])
      @box.insert_at_new_scope_and_position(@column.id, params[:position])
    end
    head :ok
  end
  
  def bookmarks
    @new_bookmarks = params[:new_bookmarks] ? @box.bookmarks.create(params[:new_bookmarks].values) : []
    @box.bookmarks.each do |bm| 
      @updated_bookmarks ||= []
      bm.attributes = params[:bookmarks][bm.id.to_s]
      @updated_bookmarks << bm and bm.save! if bm.changed?
    end
    render_json_data({:new_bookmarks => @new_bookmarks, :updated_bookmarks => @updated_bookmarks})
  end
  
  
  protected
  
  def find_box
    @box = current_user.boxes.find(params[:id])
  end
  
  
end



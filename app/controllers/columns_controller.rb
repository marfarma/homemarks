class ColumnsController < ApplicationController  
  
  before_filter :find_column, :except => :create
  # after_filter :expire_user_home_cache
  
  
  def create
    @column = current_user.columns.create!
    render_json_data(@column.id)
  end
  
  def destroy
    @column.destroy
    head :ok
  end
  
  def sort
    @column.insert_at(params[:position])
    head :ok
  end
  
  
  protected
  
  def find_column
    @column = current_user.columns.find(params[:id])
  end
  
  
end


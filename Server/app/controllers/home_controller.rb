class HomeController < ApplicationController
  skip_before_action :verify_authenticity_token
  def index
  
  end

  def help
  end

  def contact

  end

  def profile
     
    begin
    if Location.find_by(user_id: current_user.id) == nil   
    Location.create(
        name: 'default',
        user_id: current_user.id,
        lat: 41.5454486,
        lon: -8.426506999999999
     )  
    end

  	aux = Location.find_by(user_id: current_user.id) 

    @location = aux
    rescue
    @location = ''
    end
    begin
      aux2 = UserValue.find_by(user_id: current_user.id)
    @min = aux2.min
    @max = aux2.max
    rescue
    @min = 0
    @max = 0
    end
  end
  
  def addLocation
   

   if params[:location][:name] != ""
   	aux = Location.find_by(user_id: current_user.id)
   
   if aux==nil

     if x = Geocoder.coordinates(params[:location][:name])
      @lat = x[0]
      @lon = x[1] 
     else
       aux.name = 'default'
       @lat =  41.5454486
       @lon = -8.426506999999999
     end
       
     Location.create(
        name: params[:name],
        user_id: current_user.id,
        lat: @lat,
        lon: @lon
     )
   else
    
     @name = params[:location][:name]
     if x = Geocoder.coordinates(params[:location][:name])
     lat = x[0]
     lon = x[1] 
     else
      @name = 'default'
      lat =  41.5454486
      lon = -8.426506999999999
     end

     
     aux.update_attributes!(
        name: @name,
        lat: lat,
        lon: lon
     	)
   end
   end   
  	 
  	 redirect_to '/profile'
  end

  def addMinMax
    
  if params[:min] != "" || params[:max] != ""
   aux = UserValue.find_by(user_id: current_user.id)

   if aux==nil
   	 min = 0
     max = 0
     min = params[:min] if params[:min] != ""
     max = params[:max] if params[:max] != ""

     UserValue.create(
     min: min,
     max: max,
     user_id: current_user.id
     )

   else
     min = 0
     max = 0
     min = params[:min] if params[:min] != ""
     max = params[:max] if params[:max] != ""
     
     aux.update_attributes(
        min: min,
        max: max,
     	)
   end
   end 

    redirect_to '/profile'
  end

  def notfound
    
  end

  def deleteNotifications
    Notification.where(user_id: current_user.id).delete
    redirect_back(fallback_location: root_path)
  end

end

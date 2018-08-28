class MapController < ApplicationController
  def index
     aux = Location.find_by(user_id: current_user.id)
   if aux != nil 
     @lat = aux.lat
     @lon = aux.lon
   else
       @lat =  41.5454486
       @lon = -8.426506999999999
   end


     @sensors = []
     @groups = []

     begin
     aux = XdkClient.all

     aux.each do |i|

        aux2 = Group.find_by(_id: i.group_id)
        if aux2.name == 'default'
        @sensors << SensorADAPTER.new(i.lat, i.lon, i.name, i._id.to_s,i.state, 1, 1)
        end  
     end 

     aux3 = Group.all

     aux3.each do |i|

        if i.name != 'default'
        @groups << GroupADAPTER.new(i.lat, i.lon, i.name, i._id.to_s)
        end  
     end 
     
     rescue
     @sensors
     @groups
     end
  end
end


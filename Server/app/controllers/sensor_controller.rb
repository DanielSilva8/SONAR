class SensorController < ApplicationController
  skip_before_action :verify_authenticity_token
  
  def list

    @sensors = []

     begin
    

    if params[:search] != nil
      begin
          aux = XdkClient.where(name: {'$regex': params[:search]} )
          @model_object = params[:search]
         redirect_to "/notfound"
        rescue
          aux = XdkClient.all
        end
    else
      aux = XdkClient.all 
    end
    
     aux.each do |i|
        @sensors << SensorADAPTER.new(i.lat, i.lon, i.name, i._id,i.state, 1, 1)
       end 
     rescue
     @sensors
    
     end
  end

  def listsearch

    @sensors = []

     begin
    

    if params[:search] != ""
      aux = XdkClient.all
      aux.each do |i|
        if i.name.include? params[:search]
        @sensors << SensorADAPTER.new(i.lat, i.lon, i.name, i._id,i.state, 1, 1)
      end
       end 
    else
      redirect_to '/sensor/list'
    end
    
     rescue
     @sensors
    
     end
  end

  def details
    
    aux = XdkClient.find_by(_id: params[:id])

    if aux != nil
    @sensor = SensorADAPTER.new(aux.lat, aux.lon, aux.name, aux._id,aux.state, 1, 1)
    @readings = []
    g = Group.find_by(id: aux.group_id )
    if g.name != 'default'
       @group = aux.group_id
       @groupstate = true
     else
       @groupstate = false
    end
    @graph = []

    aux2 = Reading.where(xdk_client_id: aux._id)
  	aux2.desc('_id').limit(10) .each do |i|
        @readings << SensorADAPTER.new(aux.lat, aux.lon, 1, 1, 1, i.value, i.date)
        @graph << SensorADAPTER.new(aux.lat, aux.lon, 1, 1, 1, i.value, i.date)
     end 

   else
    redirect_to "/notfound"
   end
  end

  def realtime
    @sensors = []

    if params[:id] != nil
    @state = true
   
    aux = XdkClient.find_by(_id: params[:id])
    
    if aux != nil
    @stateSensor = aux.state
    @readings = []
     @name = aux.name
     @ref = aux._id
    aux2 = Reading.where(xdk_client_id: aux._id)
    aux2.desc('_id').each do |i|
        @sensors << SensorADAPTER.new(aux.lat, aux.lon, aux.name, aux._id, 1, i.value, i.date)
     end 
   else
    redirect_to "/notfound"
   end
    else
      @state = false
      @sensors = []

     begin
     aux = Reading.all

     aux.each do |i|
         aux2 = XdkClient.find_by(_id: i.xdk_client_id)
        @sensors << SensorADAPTER.new(aux2.lat, aux2.lon, aux2.name, aux2._id, 1, i.value, i.date)
       end 
     rescue
     @sensors
     end

    end

    
  end

  def group 
    @sensors = []
     begin
     aux = Group.find_by(_id: params[:id])
     aux2 = XdkClient.where(group_id: params[:id])
     @name = aux.name
     @ref = aux._id
     @lat = aux.lat 
     @lon = aux.lon

        aux2.each do |i|
          @sensors << SensorADAPTER.new(i.lat, i.lon, i.name, i._id,i.state, 1, 1)
        end 
     rescue
     @sensors
     end
  end

  def listgroup
    
    @groups = []

    begin
    aux = Group.all 
    
        aux.each do |i|
          if i.name != 'default'
           @groups << GroupADAPTER.new(i.lat, i.lon, i.name, i._id.to_s)
          end 
        end  
    rescue
     @groups
    end

  end

  def addgroup
    if params[:name] != "" and params[:lat] != "" and params[:lon] != ""
   aux = Group.find_by(lat: params[:lat], lon: params[:lon])

   if aux==nil
    Group.create( 
      lat: params[:lat],
      lon: params[:lon],
      name: params[:name]
   )
   end
   end 

    redirect_to '/sensor/listgroup'
  end

end
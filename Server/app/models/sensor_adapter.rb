class SensorADAPTER

  def initialize(lat, lon, name, ref, state, aco, date)
     @lat = lat
     @lon = lon
     @name = name
     @ref = ref
     @state = state
     @aco = aco
     @date = date
 end

  def getAco
  @aco
 end

 def getDate
  @date
 end

 def getLat
    @lat
 end

def getLon
    @lon
 end

 def getName
    @name
 end
 def getState
    @state
 end
 def getRef
    @ref
 end
end
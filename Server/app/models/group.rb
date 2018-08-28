class Group
  include Mongoid::Document
  has_many :xdk_clients
  
  field :name, type: String
  field :lat, type: Float
  field :lon, type: Float
end

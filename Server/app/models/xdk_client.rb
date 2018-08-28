class XdkClient
  include Mongoid::Document
  include Mongoid::Attributes::Dynamic

  field :ref, type: String
  field :lat, type: Float
  field :lon, type: Float
  field :name, type: String
  field :state, type: Integer
  
  has_many :notifications
  belongs_to :group
end

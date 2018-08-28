class UserValue
  include Mongoid::Document
  field :min, type: Float
  field :max, type: Float
  belongs_to :user
end

require 'test_helper'

class SensorControllerTest < ActionDispatch::IntegrationTest
  test "should get list" do
    get sensor_list_url
    assert_response :success
  end

  test "should get details" do
    get sensor_details_url
    assert_response :success
  end

  test "should get realtime" do
    get sensor_realtime_url
    assert_response :success
  end

end

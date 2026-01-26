import mongoose from "mongoose";

const ManualHotelSchema = new mongoose.Schema({
  name: String,
  price: Number,
  type: String, // hotel | dharamshala | ngo
  lat: Number,
  lng: Number,
  phone: String,
  image: String,
});

export default mongoose.models.ManualHotel || mongoose.model("ManualHotel", ManualHotelSchema);

import mongoose from "mongoose";

const TripSchema = new mongoose.Schema(
  {
    userId: String,
    start: String,
    end: String,
    distance: String,
    time: String,
    bestStop: {
      name: String,
      price: Number,
      eta: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);

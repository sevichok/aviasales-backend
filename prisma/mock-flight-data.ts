import { Flight, FlightStatus, City, Plane } from "@prisma/client";

function getRandom(arr: any[]) {
  const index = Math.floor(Math.random() * arr.length);
  return index;
}
function generateRandomDates() {
  let start
  let end
  do {
    start = new Date()
    end = new Date()
    start.setHours(Math.floor(Math.random() * 23))
    end.setHours(Math.floor(Math.random() * 23))
  } while (start >= end)
  return [start, end]
}

export async function mock(cities: City[], planes: Plane[]) {
  const mockFlights: Omit<Flight, "id">[] = [];
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);


  for (let i = 1; i < cities.length; i++) {
    for (let j = 0; j < 10; j++) {
      const [start, end] = generateRandomDates();

      const random_index = Math.floor(Math.random() * (cities.length - 1))
      const random_index2 = Math.floor(Math.random() * (cities.length - 1))
      if (random_index === random_index2) {
        continue
      }
      const indexPlane = getRandom(planes);
      let mockFlight: Omit<Flight, "id"> = {
        start_flight_date: start,
        end_flight_date: end,
        from_city_id: cities[random_index].id,
        to_city_id: cities[random_index2].id,
        status: FlightStatus.Planned,
        price: Math.floor(Math.random() * 1000),
        plane_id: planes[indexPlane].id,
        available_seats: planes[indexPlane].seats,
      };
      mockFlights.push(mockFlight);
    }
  }
  return mockFlights;
}

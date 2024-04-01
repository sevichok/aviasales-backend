import { Injectable } from "@nestjs/common";
import { FlightsReposService } from "@/backend/domain/repos/flights-repos.service";
import { CityReposService } from "@/backend/domain/repos/city-repos.service";
import { City, Flight } from "@prisma/client";

@Injectable()
export class FlightsService {
  constructor(
    private flightRepo: FlightsReposService,
    private cityRepo: CityReposService,
  ) {}
  async convertToGraph(arr: Flight[]) {
    const graph = {};
    arr.forEach((flight: Flight) => {
      // Create nodes in the graph if not already present
      if (!graph[flight.from_city_id]) {
        graph[flight.from_city_id] = {};
      }
      if (!graph[flight.to_city_id]) {
        graph[flight.to_city_id] = {};
      }

      // Add edges with weights to represent start_date, end_date, or price
      const root = graph[flight.from_city_id][flight.to_city_id];
      if (root) {
        graph[flight.from_city_id][flight.to_city_id] = [...root, flight];
      } else {
        graph[flight.from_city_id][flight.to_city_id] = [flight];
      }
    });
    return graph;
  }
  async getAllFlights(
    data: Pick<Flight, "start_flight_date" | "from_city_id">,
  ) {
    return this.flightRepo.getAllFlights(data);
  }
  async findAllPaths(
    graph,
    start: City,
    end: City,
    date1: Pick<Flight, "start_flight_date">,
    isReturn: boolean,
    date2: Pick<Flight, "start_flight_date">,
    maximum_number_of_flights: number = 4, // максимально 4 полета (3 пересадки)
  ) {
    const max_transfer_time = 24 * 60 * 60 * 1000; //24 часа в мс (максимальное время пересадки)
    const algorithm = (
      isReturn: boolean,
      max_transfer_time: number,
      start: City,
      end: City,
      date: Pick<Flight, "start_flight_date">,
    ) => {
      const queue = [
        [{ [start.id]: { end_flight_date: date.start_flight_date } }],
      ];
      const path = [];
      while (queue.length > 0) {
        const currentPath = queue.shift();
        if (currentPath.length > maximum_number_of_flights) {
          // если полетов больше чем максимум => пропускаем путь
          continue;
        }
        const currentPathKeys = currentPath.reduce(
          (container, obj) => [...container, ...Object.keys(obj)],
          [],
        ); // массив из id посещенных городов
        const current_node_id = Object.keys(currentPath.at(-1))[0]; //  айди последнего элемента в нынешнем пути
        const currentNode = currentPath.at(-1)[current_node_id]; //  данные последнего полета по айди

        if (current_node_id === end.id) {
          //если попали в конечный город , то сохраняем путь

          const transformedPath =
            this.transformPathToArrayOfFlights(currentPath);
          let repeatedPath = [];
          if (isReturn) {
            const isRetuenPath = false;
            repeatedPath = algorithm(
              isRetuenPath,
              max_transfer_time,
              end,
              start,
              date2,
            );
            repeatedPath.map((rep_path) => {
              path.push([...transformedPath, ...rep_path]);
            });
          } else {
            path.push(transformedPath);
          }
        } else {
          for (const neighbor in graph[current_node_id]) {
            //перебор всех маршрутов (из точки А в В)

            const flights = graph[current_node_id][neighbor]; //массив всех полетов из точки А в В
            flights.map((flight) => {
              // перебор всех полетов по маршруту(полеты из точки А в В)
              const prev_fluing_time = currentNode.end_flight_date.getTime(); //время прибытия в аэропорт
              const next_fluing_time = flight.start_flight_date.getTime(); //время вылета
              const transfer_time = next_fluing_time - prev_fluing_time; //время пересадки
              if (currentPathKeys.includes(neighbor)) {
                //не залетаем два раза в один и тот же город
                return;
              }
              if (transfer_time < 0 || transfer_time > max_transfer_time) {
                // время пересадки должно быть положительным и не более 24ч

                return;
              }
              queue.push([...currentPath, { [neighbor]: flight }]);
            });
          }
        }
      }

      return path;
    };
    return algorithm(isReturn, max_transfer_time, start, end, date1);
  }
  async changeFlightStatus(data: Pick<Flight, "id" | "status">) {
    return this.flightRepo.changeFlightStatus(data);
  }
  async changeFlightPrice(data: Pick<Flight, "id" | "price">) {
    return this.flightRepo.changeFlightPrice(data);
  }
  async getFlightById(id: Pick<Flight, "id">) {
    return this.flightRepo.getFlightById(id);
  }

  async getCityByTitle(title: Pick<City, "title">) {
    return this.cityRepo.getCityByTitle(title);
  }
  transformPathToArrayOfFlights(path) {
    path.shift(); // delete empty object
    return path.map((path) => {
      return Object.values(path)[0];
    });
  }
  sortArraysByTotalPrice(arrays) {
    return arrays
      .map((subArray) => {
        const totalPrice = subArray.reduce((sum, item) => sum + item.price, 0);
        return { subArray, totalPrice };
      })
      .sort((a, b) => a.totalPrice - b.totalPrice)
      .map((entry) => entry.subArray);
  }
  sortArraysByTotalTime(arrays) {
    return arrays
      .map((subArray) => {
        const totalTime =
          subArray.at(-1).end_flight_date - subArray[0].start_flight_date;
        return { subArray, totalTime };
      })
      .sort((a, b) => a.totalTime - b.totalTime)
      .map((entry) => entry.subArray);
  }
}

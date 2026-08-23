export type PropRow = {
  player: string;
  pos: "QB" | "RB" | "WR" | "TE";
  team: string;
  opponent: string;
  pass_yds: number;
  opp_pass_rk: number;
  rush_yds: number;
  opp_rush_rk: number;
  rec_yds: number;
  opp_wr_rk: number;
  opp_te_rk: number;
  opp_rec_rk: number;
};

/** Week 1 2026 — Clay baseline adjusted for opponent D + home/road */
export const NFL_PROPS_WEEK1: PropRow[] = [
  { player: "Josh Allen", pos: "QB", team: "Buffalo Bills", opponent: "@ Houston Texans", pass_yds: 205, opp_pass_rk: 5, rush_yds: 29, opp_rush_rk: 4, rec_yds: 0, opp_wr_rk: 5, opp_te_rk: 5, opp_rec_rk: 5 },
  { player: "C.J. Stroud", pos: "QB", team: "Houston Texans", opponent: "vs. Buffalo Bills", pass_yds: 204, opp_pass_rk: 1, rush_yds: 16, opp_rush_rk: 31, rec_yds: 0, opp_wr_rk: 1, opp_te_rk: 1, opp_rec_rk: 1 },
  { player: "Lamar Jackson", pos: "QB", team: "Baltimore Ravens", opponent: "@ Indianapolis Colts", pass_yds: 251, opp_pass_rk: 32, rush_yds: 35, opp_rush_rk: 7, rec_yds: 0, opp_wr_rk: 32, opp_te_rk: 32, opp_rec_rk: 32 },
  { player: "Daniel Jones", pos: "QB", team: "Indianapolis Colts", opponent: "vs. Baltimore Ravens", pass_yds: 247, opp_pass_rk: 29, rush_yds: 16, opp_rush_rk: 8, rec_yds: 0, opp_wr_rk: 29, opp_te_rk: 29, opp_rec_rk: 29 },
  { player: "Jordan Love", pos: "QB", team: "Green Bay Packers", opponent: "@ Minnesota Vikings", pass_yds: 202, opp_pass_rk: 2, rush_yds: 13, opp_rush_rk: 24, rec_yds: 0, opp_wr_rk: 2, opp_te_rk: 2, opp_rec_rk: 2 },
  { player: "Kyler Murray", pos: "QB", team: "Minnesota Vikings", opponent: "vs. Green Bay Packers", pass_yds: 185, opp_pass_rk: 11, rush_yds: 26, opp_rush_rk: 17, rec_yds: 0, opp_wr_rk: 11, opp_te_rk: 11, opp_rec_rk: 11 },
  { player: "Jalen Hurts", pos: "QB", team: "Philadelphia Eagles", opponent: "vs. Washington Commanders", pass_yds: 249, opp_pass_rk: 30, rush_yds: 29, opp_rush_rk: 29, rec_yds: 0, opp_wr_rk: 30, opp_te_rk: 30, opp_rec_rk: 30 },
  { player: "Jayden Daniels", pos: "QB", team: "Washington Commanders", opponent: "@ Philadelphia Eagles", pass_yds: 200, opp_pass_rk: 6, rush_yds: 40, opp_rush_rk: 19, rec_yds: 0, opp_wr_rk: 6, opp_te_rk: 6, opp_rec_rk: 6 },
  { player: "Jared Goff", pos: "QB", team: "Detroit Lions", opponent: "vs. New Orleans Saints", pass_yds: 222, opp_pass_rk: 4, rush_yds: 3, opp_rush_rk: 21, rec_yds: 0, opp_wr_rk: 4, opp_te_rk: 4, opp_rec_rk: 4 },
  { player: "Patrick Mahomes", pos: "QB", team: "Kansas City Chiefs", opponent: "vs. Denver Broncos", pass_yds: 218, opp_pass_rk: 8, rush_yds: 17, opp_rush_rk: 3, rec_yds: 0, opp_wr_rk: 8, opp_te_rk: 8, opp_rec_rk: 8 },
  { player: "Bo Nix", pos: "QB", team: "Denver Broncos", opponent: "@ Kansas City Chiefs", pass_yds: 212, opp_pass_rk: 12, rush_yds: 19, opp_rush_rk: 9, rec_yds: 0, opp_wr_rk: 12, opp_te_rk: 12, opp_rec_rk: 12 },
  { player: "Joe Burrow", pos: "QB", team: "Cincinnati Bengals", opponent: "vs. Tampa Bay Buccaneers", pass_yds: 267, opp_pass_rk: 25, rush_yds: 10, opp_rush_rk: 5, rec_yds: 0, opp_wr_rk: 25, opp_te_rk: 25, opp_rec_rk: 25 },
  { player: "Baker Mayfield", pos: "QB", team: "Tampa Bay Buccaneers", opponent: "@ Cincinnati Bengals", pass_yds: 240, opp_pass_rk: 23, rush_yds: 21, opp_rush_rk: 32, rec_yds: 0, opp_wr_rk: 23, opp_te_rk: 23, opp_rec_rk: 23 },
  { player: "Matthew Stafford", pos: "QB", team: "Los Angeles Rams", opponent: "vs. San Francisco 49ers", pass_yds: 274, opp_pass_rk: 24, rush_yds: 2, opp_rush_rk: 11, rec_yds: 0, opp_wr_rk: 24, opp_te_rk: 24, opp_rec_rk: 24 },
  { player: "Brock Purdy", pos: "QB", team: "San Francisco 49ers", opponent: "@ Los Angeles Rams", pass_yds: 240, opp_pass_rk: 18, rush_yds: 15, opp_rush_rk: 10, rec_yds: 0, opp_wr_rk: 18, opp_te_rk: 18, opp_rec_rk: 18 },
  { player: "Caleb Williams", pos: "QB", team: "Chicago Bears", opponent: "@ Carolina Panthers", pass_yds: 218, opp_pass_rk: 15, rush_yds: 23, opp_rush_rk: 22, rec_yds: 0, opp_wr_rk: 15, opp_te_rk: 15, opp_rec_rk: 15 },
  { player: "Dak Prescott", pos: "QB", team: "Dallas Cowboys", opponent: "@ New York Giants", pass_yds: 236, opp_pass_rk: 17, rush_yds: 12, opp_rush_rk: 30, rec_yds: 0, opp_wr_rk: 17, opp_te_rk: 17, opp_rec_rk: 17 },
  { player: "Justin Herbert", pos: "QB", team: "Los Angeles Chargers", opponent: "vs. Arizona Cardinals", pass_yds: 249, opp_pass_rk: 26, rush_yds: 26, opp_rush_rk: 23, rec_yds: 0, opp_wr_rk: 26, opp_te_rk: 26, opp_rec_rk: 26 },
  { player: "Trevor Lawrence", pos: "QB", team: "Jacksonville Jaguars", opponent: "vs. Cleveland Browns", pass_yds: 204, opp_pass_rk: 3, rush_yds: 20, opp_rush_rk: 18, rec_yds: 0, opp_wr_rk: 3, opp_te_rk: 3, opp_rec_rk: 3 },
  { player: "Sam Darnold", pos: "QB", team: "Seattle Seahawks", opponent: "vs. New England Patriots", pass_yds: 220, opp_pass_rk: 9, rush_yds: 7, opp_rush_rk: 6, rec_yds: 0, opp_wr_rk: 9, opp_te_rk: 9, opp_rec_rk: 9 },
  { player: "Drake Maye", pos: "QB", team: "New England Patriots", opponent: "@ Seattle Seahawks", pass_yds: 221, opp_pass_rk: 10, rush_yds: 27, opp_rush_rk: 2, rec_yds: 0, opp_wr_rk: 10, opp_te_rk: 10, opp_rec_rk: 10 },
  { player: "Ashton Jeanty", pos: "RB", team: "Las Vegas Raiders", opponent: "vs. Miami Dolphins", pass_yds: 0, opp_pass_rk: 20, rush_yds: 74, opp_rush_rk: 28, rec_yds: 31, opp_wr_rk: 20, opp_te_rk: 20, opp_rec_rk: 20 },
  { player: "James Cook", pos: "RB", team: "Buffalo Bills", opponent: "@ Houston Texans", pass_yds: 0, opp_pass_rk: 5, rush_yds: 71, opp_rush_rk: 4, rec_yds: 16, opp_wr_rk: 5, opp_te_rk: 5, opp_rec_rk: 5 },
  { player: "Jonathan Taylor", pos: "RB", team: "Indianapolis Colts", opponent: "vs. Baltimore Ravens", pass_yds: 0, opp_pass_rk: 29, rush_yds: 79, opp_rush_rk: 8, rec_yds: 26, opp_wr_rk: 29, opp_te_rk: 29, opp_rec_rk: 29 },
  { player: "Derrick Henry", pos: "RB", team: "Baltimore Ravens", opponent: "@ Indianapolis Colts", pass_yds: 0, opp_pass_rk: 32, rush_yds: 76, opp_rush_rk: 7, rec_yds: 14, opp_wr_rk: 32, opp_te_rk: 32, opp_rec_rk: 32 },
  { player: "De'Von Achane", pos: "RB", team: "Miami Dolphins", opponent: "@ Las Vegas Raiders", pass_yds: 0, opp_pass_rk: 7, rush_yds: 71, opp_rush_rk: 13, rec_yds: 27, opp_wr_rk: 7, opp_te_rk: 7, opp_rec_rk: 7 },
  { player: "Josh Jacobs", pos: "RB", team: "Green Bay Packers", opponent: "@ Minnesota Vikings", pass_yds: 0, opp_pass_rk: 2, rush_yds: 72, opp_rush_rk: 24, rec_yds: 14, opp_wr_rk: 2, opp_te_rk: 2, opp_rec_rk: 2 },
  { player: "Bijan Robinson", pos: "RB", team: "Atlanta Falcons", opponent: "@ Pittsburgh Steelers", pass_yds: 0, opp_pass_rk: 28, rush_yds: 75, opp_rush_rk: 12, rec_yds: 45, opp_wr_rk: 28, opp_te_rk: 28, opp_rec_rk: 28 },
  { player: "David Montgomery", pos: "RB", team: "Houston Texans", opponent: "vs. Buffalo Bills", pass_yds: 0, opp_pass_rk: 1, rush_yds: 61, opp_rush_rk: 31, rec_yds: 12, opp_wr_rk: 1, opp_te_rk: 1, opp_rec_rk: 1 },
  { player: "Jordan Mason", pos: "RB", team: "Minnesota Vikings", opponent: "vs. Green Bay Packers", pass_yds: 0, opp_pass_rk: 11, rush_yds: 53, opp_rush_rk: 17, rec_yds: 5, opp_wr_rk: 11, opp_te_rk: 11, opp_rec_rk: 11 },
  { player: "Saquon Barkley", pos: "RB", team: "Philadelphia Eagles", opponent: "vs. Washington Commanders", pass_yds: 0, opp_pass_rk: 30, rush_yds: 85, opp_rush_rk: 29, rec_yds: 24, opp_wr_rk: 30, opp_te_rk: 30, opp_rec_rk: 30 },
  { player: "Justin Jefferson", pos: "WR", team: "Minnesota Vikings", opponent: "vs. Green Bay Packers", pass_yds: 0, opp_pass_rk: 11, rush_yds: 0, opp_rush_rk: 17, rec_yds: 76, opp_wr_rk: 11, opp_te_rk: 11, opp_rec_rk: 11 },
  { player: "Tyler Warren", pos: "TE", team: "Indianapolis Colts", opponent: "vs. Baltimore Ravens", pass_yds: 0, opp_pass_rk: 29, rush_yds: 0, opp_rush_rk: 8, rec_yds: 59, opp_wr_rk: 29, opp_te_rk: 29, opp_rec_rk: 29 },
];
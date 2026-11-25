"use client";

const TEAMS = [
  { rank: 1, team: "Georgia", hybrid: 0.9512, record: "10-1", q1: "3-0", q2: "2-0", q3: "2-1", q4: "3-0" },
  { rank: 2, team: "Texas", hybrid: 0.9142, record: "9-2", q1: "2-1", q2: "3-1", q3: "2-0", q4: "2-0" },
  { rank: 3, team: "Utah", hybrid: 0.8746, record: "11-0", q1: "2-0", q2: "2-0", q3: "3-0", q4: "4-0" },
  { rank: 4, team: "Tennessee", hybrid: 0.809, record: "9-2", q1: "1-2", q2: "1-0", q3: "4-0", q4: "3-0" },
  { rank: 5, team: "Notre Dame", hybrid: 0.8052, record: "10-1", q1: "1-1", q2: "1-0", q3: "3-0", q4: "5-0" },
  { rank: 6, team: "Miami", hybrid: 0.799, record: "10-1", q1: "1-1", q2: "2-0", q3: "2-0", q4: "5-0" },
  { rank: 7, team: "Oregon", hybrid: 0.7973, record: "8-3", q1: "2-2", q2: "2-1", q3: "1-0", q4: "3-0" },
  { rank: 8, team: "Texas Tech", hybrid: 0.796, record: "10-1", q1: "1-0", q2: "3-0", q3: "3-1", q4: "3-0" },
  { rank: 9, team: "Wake Forest", hybrid: 0.7859, record: "10-1", q1: "1-1", q2: "1-0", q3: "1-0", q4: "7-0" },
  { rank: 10, team: "Alabama", hybrid: 0.7657, record: "9-2", q1: "1-2", q2: "2-0", q3: "2-0", q4: "4-0" },
  { rank: 11, team: "UCLA", hybrid: 0.7579, record: "10-1", q1: "1-0", q2: "0-1", q3: "5-0", q4: "4-0" },
  { rank: 12, team: "Iowa", hybrid: 0.7424, record: "9-2", q1: "1-0", q2: "2-1", q3: "2-1", q4: "4-0" },
  { rank: 13, team: "Indiana", hybrid: 0.7337, record: "9-2", q1: "1-1", q2: "2-1", q3: "1-0", q4: "5-0" },
  { rank: 14, team: "BYU", hybrid: 0.7206, record: "9-2", q1: "1-1", q2: "2-1", q3: "3-0", q4: "3-0" },
  { rank: 15, team: "Louisville", hybrid: 0.7169, record: "8-3", q1: "0-1", q2: "1-1", q3: "3-1", q4: "4-0" },
  { rank: 16, team: "Boise State", hybrid: 0.6617, record: "9-2", q1: "0-1", q2: "2-0", q3: "2-1", q4: "5-0" },
  { rank: 17, team: "Ohio State", hybrid: 0.6609, record: "7-4", q1: "2-4", q2: "0-0", q3: "1-0", q4: "4-0" },
  { rank: 18, team: "Liberty", hybrid: 0.6438, record: "10-1", q1: "0-1", q2: "0-0", q3: "3-0", q4: "7-0" },
  { rank: 19, team: "USC", hybrid: 0.6329, record: "8-3", q1: "1-2", q2: "2-1", q3: "2-0", q4: "3-0" },
  { rank: 20, team: "New Mexico", hybrid: 0.629, record: "9-2", q1: "0-1", q2: "1-0", q3: "2-1", q4: "6-0" },
  { rank: 21, team: "Oklahoma State", hybrid: 0.6222, record: "7-4", q1: "1-2", q2: "0-1", q3: "4-1", q4: "2-0" },
  { rank: 22, team: "Oklahoma", hybrid: 0.6186, record: "7-4", q1: "2-1", q2: "2-2", q3: "1-1", q4: "2-0" },
  { rank: 23, team: "Washington", hybrid: 0.6176, record: "7-4", q1: "2-2", q2: "0-1", q3: "0-0", q4: "5-1" },
  { rank: 24, team: "Houston", hybrid: 0.6069, record: "8-3", q1: "0-2", q2: "2-0", q3: "3-1", q4: "3-0" },
  { rank: 25, team: "Nebraska", hybrid: 0.5918, record: "7-4", q1: "0-2", q2: "1-2", q3: "0-0", q4: "6-0" },
  { rank: 26, team: "LSU", hybrid: 0.5897, record: "6-5", q1: "0-4", q2: "1-1", q3: "2-0", q4: "3-0" },
  { rank: 27, team: "Florida", hybrid: 0.5859, record: "7-4", q1: "1-1", q2: "3-3", q3: "1-0", q4: "2-0" },
  { rank: 28, team: "Ole Miss", hybrid: 0.5853, record: "7-4", q1: "1-4", q2: "1-0", q3: "3-0", q4: "2-0" },
  { rank: 29, team: "Arizona", hybrid: 0.5802, record: "8-3", q1: "0-3", q2: "0-0", q3: "3-0", q4: "5-0" },
  { rank: 30, team: "North Dakota State", hybrid: 0.5773, record: "9-2", q1: "0-1", q2: "1-1", q3: "1-0", q4: "7-0" },
  { rank: 31, team: "Penn State", hybrid: 0.575, record: "6-5", q1: "1-0", q2: "0-2", q3: "0-2", q4: "5-1" },
  { rank: 32, team: "South Carolina", hybrid: 0.5738, record: "6-5", q1: "3-2", q2: "0-0", q3: "0-2", q4: "3-1" },
  { rank: 33, team: "James Madison", hybrid: 0.5729, record: "8-3", q1: "0-0", q2: "2-1", q3: "1-1", q4: "5-1" },
  { rank: 34, team: "Duke", hybrid: 0.5705, record: "7-4", q1: "0-1", q2: "1-0", q3: "2-2", q4: "4-1" },
  { rank: 35, team: "Memphis", hybrid: 0.5683, record: "8-3", q1: "0-1", q2: "1-0", q3: "1-2", q4: "6-0" },
  { rank: 36, team: "Toledo", hybrid: 0.5569, record: "9-2", q1: "0-0", q2: "0-0", q3: "2-0", q4: "7-2" },
  { rank: 37, team: "Texas State", hybrid: 0.5515, record: "7-4", q1: "0-2", q2: "0-0", q3: "3-2", q4: "4-0" },
  { rank: 38, team: "Auburn", hybrid: 0.5495, record: "7-4", q1: "1-2", q2: "1-2", q3: "1-0", q4: "4-0" },
  { rank: 39, team: "Louisiana Tech", hybrid: 0.5456, record: "9-2", q1: "0-1", q2: "0-1", q3: "2-0", q4: "7-0" },
  { rank: 40, team: "Tulsa", hybrid: 0.5405, record: "7-4", q1: "0-0", q2: "1-0", q3: "2-3", q4: "4-1" },
  { rank: 41, team: "Kentucky", hybrid: 0.5388, record: "7-4", q1: "2-2", q2: "1-2", q3: "1-0", q4: "3-0" },
  { rank: 42, team: "UTSA", hybrid: 0.538, record: "9-2", q1: "0-1", q2: "1-0", q3: "4-1", q4: "4-0" },
  { rank: 43, team: "Air Force", hybrid: 0.5364, record: "9-2", q1: "0-0", q2: "0-1", q3: "4-1", q4: "5-0" },
  { rank: 44, team: "Georgia Southern", hybrid: 0.5335, record: "7-4", q1: "0-0", q2: "0-4", q3: "2-0", q4: "5-0" },
  { rank: 45, team: "Baylor", hybrid: 0.5283, record: "6-5", q1: "0-2", q2: "1-1", q3: "2-2", q4: "3-0" },
  { rank: 46, team: "Wisconsin", hybrid: 0.5274, record: "7-4", q1: "1-3", q2: "1-0", q3: "0-1", q4: "5-0" },
  { rank: 47, team: "Missouri", hybrid: 0.5182, record: "7-4", q1: "0-3", q2: "1-0", q3: "3-1", q4: "3-0" },
  { rank: 48, team: "Louisiana", hybrid: 0.5181, record: "8-3", q1: "0-1", q2: "0-1", q3: "0-0", q4: "8-1" },
  { rank: 49, team: "Clemson", hybrid: 0.5128, record: "7-4", q1: "1-2", q2: "1-0", q3: "3-0", q4: "2-2" },
  { rank: 50, team: "Jacksonville State", hybrid: 0.5076, record: "8-3", q1: "0-1", q2: "0-0", q3: "2-1", q4: "6-1" },
  { rank: 51, team: "Illinois", hybrid: 0.5074, record: "6-5", q1: "1-3", q2: "1-1", q3: "1-0", q4: "3-1" },
  { rank: 52, team: "UCF", hybrid: 0.5059, record: "6-5", q1: "1-2", q2: "0-0", q3: "2-3", q4: "3-0" },
  { rank: 53, team: "TCU", hybrid: 0.4971, record: "5-6", q1: "0-3", q2: "1-1", q3: "0-1", q4: "4-1" },
  { rank: 54, team: "Michigan", hybrid: 0.4922, record: "6-5", q1: "1-3", q2: "2-0", q3: "1-1", q4: "2-1" },
  { rank: 55, team: "SMU", hybrid: 0.4907, record: "7-4", q1: "0-3", q2: "0-1", q3: "1-0", q4: "6-0" },
  { rank: 57, team: "UConn", hybrid: 0.4892, record: "6-5", q1: "0-0", q2: "1-1", q3: "0-3", q4: "5-1" },
  { rank: 58, team: "North Texas", hybrid: 0.4866, record: "7-4", q1: "0-1", q2: "1-2", q3: "3-1", q4: "3-0" },
  { rank: 59, team: "Syracuse", hybrid: 0.4712, record: "5-6", q1: "0-0", q2: "1-1", q3: "3-3", q4: "1-2" },
  { rank: 60, team: "Fresno State", hybrid: 0.4702, record: "6-5", q1: "0-1", q2: "0-2", q3: "0-2", q4: "6-0" },
  { rank: 61, team: "UNLV", hybrid: 0.4663, record: "7-4", q1: "1-0", q2: "1-3", q3: "0-0", q4: "5-1" },
  { rank: 62, team: "Western Michigan", hybrid: 0.466, record: "8-4", q1: "0-0", q2: "0-3", q3: "1-1", q4: "7-0" },
  { rank: 63, team: "North Carolina", hybrid: 0.4635, record: "5-6", q1: "1-2", q2: "1-2", q3: "2-2", q4: "1-0" },
  { rank: 64, team: "Miami (OH)", hybrid: 0.4635, record: "8-4", q1: "0-0", q2: "0-0", q3: "2-2", q4: "6-2" },
  { rank: 65, team: "South Florida", hybrid: 0.4619, record: "6-5", q1: "0-0", q2: "0-2", q3: "1-2", q4: "5-1" },
  { rank: 66, team: "Florida Atlantic", hybrid: 0.4597, record: "7-4", q1: "0-1", q2: "0-2", q3: "2-1", q4: "5-0" },
  { rank: 67, team: "Arizona State", hybrid: 0.4557, record: "6-5", q1: "0-2", q2: "1-1", q3: "1-2", q4: "4-0" },
  { rank: 68, team: "San Diego State", hybrid: 0.4543, record: "6-5", q1: "1-1", q2: "0-2", q3: "2-1", q4: "3-1" },
  { rank: 69, team: "Pittsburgh", hybrid: 0.4511, record: "6-5", q1: "0-2", q2: "0-0", q3: "4-1", q4: "2-2" },
  { rank: 70, team: "NC State", hybrid: 0.4497, record: "5-6", q1: "0-1", q2: "1-1", q3: "1-3", q4: "3-1" },
  { rank: 71, team: "Cincinnati", hybrid: 0.4489, record: "6-5", q1: "1-3", q2: "0-0", q3: "1-2", q4: "4-0" },
  { rank: 72, team: "Oregon State", hybrid: 0.4484, record: "6-5", q1: "0-3", q2: "0-1", q3: "1-1", q4: "5-0" },
  { rank: 73, team: "Kansas", hybrid: 0.4459, record: "4-7", q1: "0-2", q2: "0-1", q3: "2-4", q4: "2-0" },
  { rank: 74, team: "Virginia", hybrid: 0.4428, record: "6-5", q1: "0-1", q2: "0-2", q3: "3-2", q4: "3-0" },
  { rank: 75, team: "Army", hybrid: 0.4414, record: "5-5", q1: "0-0", q2: "1-2", q3: "1-2", q4: "3-1" },
  { rank: 76, team: "Ohio", hybrid: 0.4407, record: "8-3", q1: "0-1", q2: "0-0", q3: "1-2", q4: "7-0" },
  { rank: 77, team: "Virginia Tech", hybrid: 0.4366, record: "6-5", q1: "0-1", q2: "1-1", q3: "1-1", q4: "4-2" },
  { rank: 78, team: "Buffalo", hybrid: 0.436, record: "8-3", q1: "0-1", q2: "1-0", q3: "1-1", q4: "6-1" },
  { rank: 79, team: "App State", hybrid: 0.4359, record: "7-4", q1: "0-0", q2: "1-1", q3: "3-1", q4: "3-2" },
  { rank: 80, team: "Northwestern", hybrid: 0.4356, record: "6-5", q1: "0-4", q2: "1-0", q3: "0-1", q4: "5-0" },
  { rank: 81, team: "Wyoming", hybrid: 0.4354, record: "7-4", q1: "0-1", q2: "1-1", q3: "1-0", q4: "5-2" },
  { rank: 82, team: "East Carolina", hybrid: 0.4279, record: "7-4", q1: "0-1", q2: "0-1", q3: "2-1", q4: "5-1" },
  { rank: 83, team: "Florida State", hybrid: 0.425, record: "5-6", q1: "0-3", q2: "0-0", q3: "1-3", q4: "4-0" },
  { rank: 84, team: "Delaware", hybrid: 0.4207, record: "6-5", q1: "0-0", q2: "0-1", q3: "0-3", q4: "6-1" },
  { rank: 85, team: "Minnesota", hybrid: 0.4199, record: "6-5", q1: "2-3", q2: "0-0", q3: "1-0", q4: "3-2" },
  { rank: 86, team: "West Virginia", hybrid: 0.4063, record: "5-6", q1: "0-1", q2: "1-3", q3: "1-1", q4: "3-1" },
  { rank: 87, team: "Kansas State", hybrid: 0.4062, record: "4-7", q1: "0-0", q2: "0-4", q3: "0-3", q4: "4-0" },
  { rank: 88, team: "UAB", hybrid: 0.4029, record: "6-5", q1: "0-0", q2: "0-3", q3: "0-2", q4: "6-0" },
  { rank: 89, team: "Navy", hybrid: 0.3962, record: "4-6", q1: "0-1", q2: "1-2", q3: "1-3", q4: "2-0" },
  { rank: 90, team: "Iowa State", hybrid: 0.3858, record: "5-6", q1: "0-4", q2: "1-2", q3: "0-0", q4: "4-0" },
  { rank: 91, team: "Tulane", hybrid: 0.3801, record: "6-5", q1: "0-1", q2: "1-0", q3: "1-4", q4: "4-0" },
  { rank: 92, team: "Kennesaw State", hybrid: 0.3761, record: "5-6", q1: "0-1", q2: "0-1", q3: "0-2", q4: "5-2" },
  { rank: 93, team: "Colorado", hybrid: 0.3729, record: "4-7", q1: "0-3", q2: "1-1", q3: "0-3", q4: "3-0" },
  { rank: 94, team: "Nevada", hybrid: 0.3684, record: "5-6", q1: "0-2", q2: "0-1", q3: "0-1", q4: "5-2" },
  { rank: 95, team: "Coastal Carolina", hybrid: 0.3656, record: "4-7", q1: "0-0", q2: "0-2", q3: "2-3", q4: "2-2" },
  { rank: 96, team: "South Alabama", hybrid: 0.3628, record: "6-5", q1: "0-0", q2: "0-2", q3: "1-3", q4: "5-0" },
  { rank: 97, team: "Maryland", hybrid: 0.3616, record: "4-7", q1: "0-4", q2: "1-0", q3: "1-1", q4: "2-2" },
  { rank: 98, team: "Georgia State", hybrid: 0.36, record: "5-6", q1: "0-1", q2: "0-1", q3: "2-3", q4: "3-1" },
  { rank: 99, team: "Mississippi State", hybrid: 0.3519, record: "5-6", q1: "1-3", q2: "0-1", q3: "2-1", q4: "2-1" },
  { rank: 100, team: "Arkansas State", hybrid: 0.3495, record: "4-7", q1: "0-0", q2: "0-4", q3: "0-1", q4: "4-2" },
  { rank: 101, team: "Utah State", hybrid: 0.341, record: "4-7", q1: "0-3", q2: "0-1", q3: "1-2", q4: "3-1" },
  { rank: 102, team: "Arkansas", hybrid: 0.3374, record: "4-7", q1: "0-4", q2: "1-1", q3: "2-2", q4: "1-0" },
  { rank: 103, team: "Marshall", hybrid: 0.3341, record: "6-5", q1: "0-2", q2: "0-1", q3: "0-0", q4: "6-2" },
  { rank: 104, team: "Texas A&M", hybrid: 0.3323, record: "4-7", q1: "0-5", q2: "0-1", q3: "1-1", q4: "3-0" },
  { rank: 105, team: "Vanderbilt", hybrid: 0.3305, record: "4-7", q1: "0-3", q2: "0-3", q3: "2-0", q4: "2-1" },
  { rank: 106, team: "Middle Tennessee", hybrid: 0.3295, record: "6-5", q1: "0-1", q2: "0-1", q3: "0-2", q4: "6-1" },
  { rank: 107, team: "Massachusetts", hybrid: 0.3191, record: "5-6", q1: "0-0", q2: "0-2", q3: "0-2", q4: "5-2" },
  { rank: 108, team: "Boston College", hybrid: 0.3154, record: "5-6", q1: "0-2", q2: "0-1", q3: "2-1", q4: "3-2" },
  { rank: 109, team: "Georgia Tech", hybrid: 0.3139, record: "3-8", q1: "0-2", q2: "2-1", q3: "0-2", q4: "1-3" },
  { rank: 110, team: "Hawai'i", hybrid: 0.3123, record: "3-8", q1: "0-0", q2: "0-2", q3: "0-4", q4: "3-2" },
  { rank: 111, team: "Florida International", hybrid: 0.3078, record: "4-7", q1: "0-1", q2: "0-1", q3: "0-4", q4: "4-1" },
  { rank: 112, team: "Missouri State", hybrid: 0.3076, record: "4-7", q1: "0-0", q2: "0-2", q3: "0-2", q4: "4-3" },
  { rank: 113, team: "Central Michigan", hybrid: 0.3056, record: "5-6", q1: "0-2", q2: "0-0", q3: "0-4", q4: "5-0" },
  { rank: 114, team: "Troy", hybrid: 0.2965, record: "4-7", q1: "1-0", q2: "0-2", q3: "0-4", q4: "3-1" },
  { rank: 115, team: "Temple", hybrid: 0.2868, record: "2-9", q1: "0-0", q2: "0-2", q3: "1-3", q4: "1-4" },
  { rank: 116, team: "Washington State", hybrid: 0.2821, record: "2-9", q1: "0-1", q2: "0-3", q3: "0-5", q4: "2-0" },
  { rank: 117, team: "San José State", hybrid: 0.2814, record: "5-7", q1: "0-1", q2: "0-2", q3: "0-3", q4: "5-1" },
  { rank: 118, team: "Stanford", hybrid: 0.2792, record: "6-5", q1: "0-5", q2: "0-0", q3: "2-0", q4: "4-0" },
  { rank: 119, team: "Colorado State", hybrid: 0.2779, record: "3-8", q1: "0-1", q2: "0-4", q3: "1-1", q4: "2-2" },
  { rank: 120, team: "Rutgers", hybrid: 0.2762, record: "3-8", q1: "1-1", q2: "0-3", q3: "1-2", q4: "1-2" },
  { rank: 121, team: "Michigan State", hybrid: 0.2753, record: "3-8", q1: "0-3", q2: "1-3", q3: "1-1", q4: "1-1" },
  { rank: 122, team: "Old Dominion", hybrid: 0.2738, record: "3-8", q1: "0-0", q2: "0-3", q3: "2-3", q4: "1-2" },
  { rank: 123, team: "Southern Miss", hybrid: 0.2706, record: "3-8", q1: "0-0", q2: "0-3", q3: "1-2", q4: "2-3" },
  { rank: 124, team: "Eastern Michigan", hybrid: 0.2555, record: "5-7", q1: "0-0", q2: "0-1", q3: "0-3", q4: "5-3" },
  { rank: 125, team: "Purdue", hybrid: 0.2545, record: "3-8", q1: "0-5", q2: "1-1", q3: "0-1", q4: "2-1" },
  { rank: 126, team: "Western Kentucky", hybrid: 0.2539, record: "4-7", q1: "0-3", q2: "0-0", q3: "1-1", q4: "3-3" },
  { rank: 127, team: "New Mexico State", hybrid: 0.2495, record: "3-8", q1: "0-0", q2: "0-2", q3: "0-2", q4: "3-4" },
  { rank: 128, team: "Bowling Green", hybrid: 0.2495, record: "3-8", q1: "0-1", q2: "0-1", q3: "1-4", q4: "2-2" },
  { rank: 129, team: "Rice", hybrid: 0.2431, record: "2-9", q1: "0-1", q2: "0-2", q3: "0-5", q4: "2-1" },
  { rank: 130, team: "California", hybrid: 0.2318, record: "3-8", q1: "0-2", q2: "1-2", q3: "0-3", q4: "2-1" },
  { rank: 131, team: "UL Monroe", hybrid: 0.2246, record: "2-9", q1: "0-0", q2: "0-0", q3: "1-7", q4: "1-2" },
  { rank: 132, team: "Ball State", hybrid: 0.198, record: "3-8", q1: "0-2", q2: "0-0", q3: "0-3", q4: "3-3" },
  { rank: 133, team: "Kent State", hybrid: 0.1753, record: "3-9", q1: "0-2", q2: "0-0", q3: "0-3", q4: "3-4" },
  { rank: 134, team: "Sacramento State", hybrid: 0.1665, record: "2-9", q1: "0-0", q2: "0-2", q3: "0-1", q4: "2-6" },
  { rank: 135, team: "Charlotte", hybrid: 0.1643, record: "1-10", q1: "0-1", q2: "0-3", q3: "0-3", q4: "1-3" },
  { rank: 136, team: "Sam Houston", hybrid: 0.1631, record: "1-10", q1: "0-2", q2: "0-1", q3: "0-1", q4: "1-6" },
  { rank: 137, team: "Akron", hybrid: 0.1594, record: "2-9", q1: "0-1", q2: "0-0", q3: "0-4", q4: "2-4" },
  { rank: 138, team: "UTEP", hybrid: 0.1162, record: "1-10", q1: "0-3", q2: "0-2", q3: "0-0", q4: "1-5" },
  { rank: 139, team: "Northern Illinois", hybrid: 0.1026, record: "0-11", q1: "0-3", q2: "0-1", q3: "0-3", q4: "0-4" },
];

function QCell({ value, color }: { value: string; color: string }) {
  const [w, l] = value.split("-").map(Number);
  const total = w + l;
  const pct = total === 0 ? 0 : w / total;
  const bg =
    pct >= 0.75
      ? "bg-emerald-900/60 text-emerald-300"
      : pct >= 0.5
        ? "bg-emerald-950/40 text-emerald-200"
        : pct > 0
          ? "bg-zinc-800 text-zinc-300"
          : "bg-zinc-900 text-zinc-500";
  return (
    <td className={`px-2 py-2 text-center text-sm font-medium ${bg} ${color}`}>
      {value}
    </td>
  );
}

export default function RatingsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href="/" className="text-zinc-400 text-sm hover:text-white">
          ← Dashboard
        </a>
        <h1 className="text-3xl font-bold mt-4">CFB Power Ratings</h1>
        <p className="text-zinc-400 mt-1 text-sm">Hybrid ranking · 2026</p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-3 w-12">#</th>
                <th className="text-left px-3 py-3">Team</th>
                <th className="text-right px-3 py-3">Hybrid</th>
                <th className="text-center px-3 py-3">Record</th>
                <th className="text-center px-2 py-3 bg-zinc-800/60 border-l border-zinc-700">Q1</th>
                <th className="text-center px-2 py-3 bg-zinc-800/60">Q2</th>
                <th className="text-center px-2 py-3 bg-zinc-800/60">Q3</th>
                <th className="text-center px-2 py-3 bg-zinc-800/60 border-r border-zinc-700">Q4</th>
              </tr>
            </thead>
            <tbody>
              {TEAMS.map((t) => (
                <tr key={t.rank} className="border-t border-zinc-800/80 hover:bg-zinc-900/50">
                  <td className="px-3 py-2 text-zinc-500 tabular-nums">{t.rank}</td>
                  <td className="px-3 py-2 font-medium">{t.team}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-zinc-300">
                    {t.hybrid.toFixed(4)}
                  </td>
                  <td className="px-3 py-2 text-center text-zinc-300">{t.record}</td>
                  <QCell value={t.q1} color="border-l border-zinc-800" />
                  <QCell value={t.q2} color="" />
                  <QCell value={t.q3} color="" />
                  <QCell value={t.q4} color="border-r border-zinc-800" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
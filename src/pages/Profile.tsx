
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Terminal, Calendar, Star, Clock, Code, BookOpen, Trophy } from 'lucide-react';

const Profile = () => {
  // Update title
  useEffect(() => {
    document.title = "Profile - PyVenture";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="glow-text">Explorer Profile</span>
            </h1>
            <p className="text-xl text-gray-300">
              Track your progress, achievements, and Python mastery journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <Card className="cosmic-card p-6 col-span-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-space-nebula to-space-neon-cyan flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-white">JS</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">Jane Smith</h2>
                <p className="text-gray-400 mb-4">Python Explorer</p>
                
                <div className="flex space-x-2 mb-6">
                  <Badge className="bg-space-nebula hover:bg-space-nebula/80">Level 12</Badge>
                  <Badge className="bg-space-meteor-orange hover:bg-space-meteor-orange/80">Intermediate</Badge>
                </div>
                
                <div className="w-full space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>XP: 3,450</span>
                      <span>Next Level: 4,000</span>
                    </div>
                    <Progress value={86} className="h-2 bg-space-deep-purple/30" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex flex-col items-center p-3 bg-space-deep-purple/20 rounded-lg">
                      <Clock className="h-5 w-5 text-space-nebula mb-1" />
                      <span className="text-sm text-gray-300">45 Days</span>
                      <span className="text-xs text-gray-500">Streak</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-space-deep-purple/20 rounded-lg">
                      <Trophy className="h-5 w-5 text-space-meteor-orange mb-1" />
                      <span className="text-sm text-gray-300">#42</span>
                      <span className="text-xs text-gray-500">Global Rank</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-space-deep-purple/20 rounded-lg">
                      <Code className="h-5 w-5 text-space-neon-cyan mb-1" />
                      <span className="text-sm text-gray-300">1,240</span>
                      <span className="text-xs text-gray-500">Lines Coded</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-space-deep-purple/20 rounded-lg">
                      <BookOpen className="h-5 w-5 text-space-nebula mb-1" />
                      <span className="text-sm text-gray-300">18/30</span>
                      <span className="text-xs text-gray-500">Challenges</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Content Area */}
            <div className="col-span-1 lg:col-span-2">
              <Tabs defaultValue="achievements">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="achievements" className="data-[state=active]:bg-space-nebula">
                    <Award className="h-4 w-4 mr-2" />
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="data-[state=active]:bg-space-nebula">
                    <Terminal className="h-4 w-4 mr-2" />
                    Progress
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="data-[state=active]:bg-space-nebula">
                    <Star className="h-4 w-4 mr-2" />
                    Stats
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="achievements" className="space-y-4">
                  <Card className="cosmic-card overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-4">Recent Achievements</h3>
                      <div className="space-y-4">
                        {[
                          { name: "Loop Master", desc: "Complete 10 loop challenges", date: "2 days ago", icon: <Award className="h-5 w-5 text-yellow-500" /> },
                          { name: "Syntax Genius", desc: "Fix 5 syntax errors without hints", date: "1 week ago", icon: <Award className="h-5 w-5 text-space-nebula" /> },
                          { name: "Algorithm Explorer", desc: "Solve a medium difficulty algorithm", date: "2 weeks ago", icon: <Award className="h-5 w-5 text-space-meteor-orange" /> }
                        ].map((achievement, i) => (
                          <div key={i} className="flex items-center p-3 bg-space-deep-purple/20 rounded-lg">
                            <div className="mr-4">
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{achievement.name}</h4>
                              <p className="text-sm text-gray-400">{achievement.desc}</p>
                            </div>
                            <div className="text-xs text-gray-500">{achievement.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">Badges Collection</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[
                        { name: "First Steps", icon: <Terminal className="h-8 w-8" />, unlocked: true },
                        { name: "Loop Explorer", icon: <Code className="h-8 w-8" />, unlocked: true },
                        { name: "Function Master", icon: <BookOpen className="h-8 w-8" />, unlocked: true },
                        { name: "OOP Wizard", icon: <Star className="h-8 w-8" />, unlocked: false },
                        { name: "API Explorer", icon: <Terminal className="h-8 w-8" />, unlocked: false },
                        { name: "Database Guru", icon: <Trophy className="h-8 w-8" />, unlocked: false }
                      ].map((badge, i) => (
                        <div key={i} className={`flex flex-col items-center p-4 rounded-lg ${badge.unlocked ? 'bg-space-deep-purple/30' : 'bg-space-deep-purple/10 opacity-50'}`}>
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${badge.unlocked ? 'bg-gradient-to-r from-space-nebula to-space-neon-cyan' : 'bg-space-deep-purple/20'}`}>
                            {badge.icon}
                          </div>
                          <span className="text-sm text-center">{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4">
                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">Learning Path</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Syntax Sands</span>
                          <span className="text-space-nebula">100%</span>
                        </div>
                        <Progress value={100} className="h-2 bg-space-deep-purple/30" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Loop Lagoon</span>
                          <span className="text-space-nebula">80%</span>
                        </div>
                        <Progress value={80} className="h-2 bg-space-deep-purple/30" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Function Fortress</span>
                          <span className="text-space-nebula">45%</span>
                        </div>
                        <Progress value={45} className="h-2 bg-space-deep-purple/30" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">OOP Observatory</span>
                          <span className="text-space-nebula">10%</span>
                        </div>
                        <Progress value={10} className="h-2 bg-space-deep-purple/30" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">API Asteroid Belt</span>
                          <span className="text-gray-500">Locked</span>
                        </div>
                        <Progress value={0} className="h-2 bg-space-deep-purple/30" />
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="stats" className="space-y-4">
                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">Coding Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Challenge Completion</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Easy Challenges</span>
                            <span>12/12</span>
                          </div>
                          <Progress value={100} className="h-1.5 bg-space-deep-purple/30" />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Medium Challenges</span>
                            <span>6/12</span>
                          </div>
                          <Progress value={50} className="h-1.5 bg-space-deep-purple/30" />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Hard Challenges</span>
                            <span>0/6</span>
                          </div>
                          <Progress value={0} className="h-1.5 bg-space-deep-purple/30" />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Topic Mastery</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Basic Syntax</span>
                            <span>90%</span>
                          </div>
                          <Progress value={90} className="h-1.5 bg-space-deep-purple/30" />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Control Flow</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-1.5 bg-space-deep-purple/30" />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Functions</span>
                            <span>60%</span>
                          </div>
                          <Progress value={60} className="h-1.5 bg-space-deep-purple/30" />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>OOP Concepts</span>
                            <span>25%</span>
                          </div>
                          <Progress value={25} className="h-1.5 bg-space-deep-purple/30" />
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">Coding Activity</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>This Week</span>
                          <span>5/7 days</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {[90, 70, 0, 85, 50, 0, 0].map((value, i) => (
                            <div key={i} className="h-16 bg-space-deep-purple/20 rounded-sm overflow-hidden">
                              <div 
                                className="bg-gradient-to-t from-space-nebula to-space-neon-cyan h-full w-full" 
                                style={{ height: `${value}%`, opacity: value ? 1 : 0.2 }}
                              ></div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 mt-1">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-xs text-gray-500">
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default Profile;

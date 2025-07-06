"use client"
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Home, 
  Trash2, 
  ArrowLeft, 
  User, 
  LogOut,
  Wheat,
  IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
interface Farmer {
  id: string;
  name: string;
  village: string;
  mobile: string;
  email: string;
  picture: string;
}

interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
}

interface Earning {
  id: number;
  amount: number;
  source: string;
  date: string;
}

const FarmerDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  
  const [farmer, setFarmer] = useState<Farmer>({
    id: '',
    name: '',
    village: 'गंगाखेड़ी',
    mobile: '',
    email: '',
    picture: ''
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'earnings'>('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddEarning, setShowAddEarning] = useState(false);

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'बीज'
  });

  const [newEarning, setNewEarning] = useState({
    amount: '',
    source: ''
  });

  console.log(session ,  'fgdgdg')
  // Initialize farmer data when session is available
  useEffect(() => {
    if (session?.user) {
      setFarmer({
        id: session.user.user_id || Date.now().toString(),
        name: session.user.name || 'किसान',
        village: 'गंगाखेड़ी',
        mobile: session.user.phone || '',
        email: session.user.email || '',
        picture: session.user.image || ''
      });
      loadUserData();
    }
  }, [session]);

  const loadUserData = () => {
    // In a real app, this would fetch from your database
    // For now, using sample data
    const sampleExpenses: Expense[] = [
      { id: 1, amount: 5000, category: 'बीज', date: '2024-12-15' },
      { id: 2, amount: 3000, category: 'खाद', date: '2024-12-10' },
      { id: 3, amount: 2000, category: 'मजदूरी', date: '2024-12-08' },
      { id: 4, amount: 1500, category: 'दवा', date: '2024-12-05' }
    ];

    const sampleEarnings: Earning[] = [
      { id: 1, amount: 25000, source: 'गेहूं बेचा', date: '2024-12-20' },
      { id: 2, amount: 15000, source: 'दूध', date: '2024-12-18' },
      { id: 3, amount: 8000, source: 'सब्जी', date: '2024-12-16' },
      { id: 4, amount: 12000, source: 'धान बेचा', date: '2024-12-12' }
    ];

    setExpenses(sampleExpenses);
    setEarnings(sampleEarnings);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalEarnings = earnings.reduce((sum, earn) => sum + earn.amount, 0);
  const netProfit = totalEarnings - totalExpenses;

  const addExpense = () => {
    if (newExpense.amount && newExpense.category) {
      const expense: Expense = {
        id: Date.now(),
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0] ?? ""
      };
      setExpenses([expense, ...expenses]);
      setNewExpense({ amount: '', category: 'बीज' });
      setShowAddExpense(false);
    }
  };

  const addEarning = () => {
    if (newEarning.amount && newEarning.source) {
      const earning: Earning = {
        id: Date.now(),
        amount: parseFloat(newEarning.amount),
        source: newEarning.source,
        date: new Date().toISOString().split('T')[0] ?? ""
      };
      setEarnings([earning, ...earnings]);
      setNewEarning({ amount: '', source: '' });
      setShowAddEarning(false);
    }
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const deleteEarning = (id: number) => {
    setEarnings(earnings.filter(e => e.id !== id));
  };

  const handleSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">लोड हो रहा है...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated - show login
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Wheat className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">किसान डैशबोर्ड</h1>
              <p className="text-gray-600 text-lg">गंगाखेड़ी गाँव</p>
              <p className="text-sm text-gray-500 mt-2">अपनी खेती का हिसाब-किताब रखें</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => handleSignIn('google')}
                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 h-14 text-lg"
              >
                {/* <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google" 
                  className="w-6 h-6 mr-3"
                /> */}
                Google से लॉगिन करें
              </Button>
              
              <Button
                onClick={() => handleSignIn('github')}
                className="w-full bg-gray-800 text-white hover:bg-gray-900 h-14 text-lg"
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub से लॉगिन करें
              </Button>

              {/* <Button
                onClick={() => handleSignIn()}
                className="w-full bg-blue-500 text-white hover:bg-blue-600 h-14 text-lg"
              >
                <User className="w-6 h-6 mr-3" />
                अन्य विकल्प
              </Button> */}
              
              <Alert>
                <AlertDescription>
                  सुरक्षित लॉगिन के लिए Google या GitHub चुनें
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const DashboardView = () => (
    <div className="space-y-6 p-4">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                {farmer.picture ? (
                  <Image 
                    src={farmer.picture} 
                    alt={farmer.name}
                    className="w-14 h-14 rounded-full object-cover"
                    layout='fill'
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold">नमस्ते, {farmer.name}</h1>
                <p className="text-green-100 text-sm">गांव: {farmer.village}</p>
                <p className="text-green-100 text-xs">{farmer.email}</p>
                {farmer.mobile && (
                  <p className="text-green-100 text-xs">{farmer.mobile}</p>
                )}
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">कुल खर्च</p>
                <p className="text-2xl font-bold text-red-700 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {totalExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">कुल आय</p>
                <p className="text-2xl font-bold text-green-700 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {totalEarnings.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${netProfit >= 0 ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'} text-sm font-medium`}>
                  कुल {netProfit >= 0 ? 'मुनाफा' : 'नुकसान'}
                </p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'} flex items-center`}>
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {Math.abs(netProfit).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4">
        <Button
          onClick={() => setShowAddExpense(true)}
          className="w-full bg-red-500 hover:bg-red-600 h-14 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          खर्च जोड़ें
        </Button>
        <Button
          onClick={() => setShowAddEarning(true)}
          className="w-full bg-green-500 hover:bg-green-600 h-14 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          आय जोड़ें
        </Button>
      </div>
    </div>
  );

  const ExpensesView = () => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">खर्च की सूची</h2>
        <Button
          onClick={() => setShowAddExpense(true)}
          className="bg-red-500 hover:bg-red-600"
          size="sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 text-lg">कोई खर्च नहीं मिला</p>
              <p className="text-gray-400 text-sm mt-2">नया खर्च जोड़ने के लिए + बटन दबाएं</p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{expense.category}</h3>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <p className="text-xl font-bold text-red-600 flex items-center">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {expense.amount.toLocaleString()}
                    </p>
                    <Button
                      onClick={() => deleteExpense(expense.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const EarningsView = () => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">आय की सूची</h2>
        <Button
          onClick={() => setShowAddEarning(true)}
          className="bg-green-500 hover:bg-green-600"
          size="sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {earnings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 text-lg">कोई आय नहीं मिली</p>
              <p className="text-gray-400 text-sm mt-2">नई आय जोड़ने के लिए + बटन दबाएं</p>
            </CardContent>
          </Card>
        ) : (
          earnings.map((earning) => (
            <Card key={earning.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{earning.source}</h3>
                    <p className="text-sm text-gray-500">{earning.date}</p>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <p className="text-xl font-bold text-green-600 flex items-center">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {earning.amount.toLocaleString()}
                    </p>
                    <Button
                      onClick={() => deleteEarning(earning.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-4">
          <div className="flex justify-around">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 flex flex-col items-center space-y-1 border-b-2 transition-colors rounded-none ${
                activeTab === 'dashboard' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">मुख्य</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('expenses')}
              className={`py-4 flex flex-col items-center space-y-1 border-b-2 transition-colors rounded-none ${
                activeTab === 'expenses' 
                  ? 'border-red-500 text-red-600 bg-red-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              <span className="text-xs font-medium">खर्च</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('earnings')}
              className={`py-4 flex flex-col items-center space-y-1 border-b-2 transition-colors rounded-none ${
                activeTab === 'earnings' 
                  ? 'border-green-500 text-green-600 bg-green-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-medium">आय</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pb-20">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'expenses' && <ExpensesView />}
        {activeTab === 'earnings' && <EarningsView />}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <Card className="w-full max-w-md rounded-t-lg rounded-b-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">नया खर्च जोड़ें</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddExpense(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense-amount" className="text-base">राशि (₹)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="text-lg h-12"
                  placeholder="राशि दर्ज करें"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category" className="text-base">क्या खरीदा?</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                >
                  <SelectTrigger className="text-lg h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="बीज">बीज</SelectItem>
                    <SelectItem value="खाद">खाद</SelectItem>
                    <SelectItem value="मजदूरी">मजदूरी</SelectItem>
                    <SelectItem value="दवा">दवा</SelectItem>
                    <SelectItem value="डीजल">डीजल</SelectItem>
                    <SelectItem value="अन्य">अन्य</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 h-12"
                >
                  रद्द करें
                </Button>
                <Button
                  onClick={addExpense}
                  className="flex-1 bg-red-500 hover:bg-red-600 h-12"
                >
                  जोड़ें
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Earning Modal */}
      {showAddEarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <Card className="w-full max-w-md rounded-t-lg rounded-b-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">नई आय जोड़ें</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddEarning(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="earning-amount" className="text-base">राशि (₹)</Label>
                <Input
                  id="earning-amount"
                  type="number"
                  value={newEarning.amount}
                  onChange={(e) => setNewEarning({...newEarning, amount: e.target.value})}
                  className="text-lg h-12"
                  placeholder="राशि दर्ज करें"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="earning-source" className="text-base">क्या बेचा?</Label>
                <Input
                  id="earning-source"
                  type="text"
                  value={newEarning.source}
                  onChange={(e) => setNewEarning({...newEarning, source: e.target.value})}
                  className="text-lg h-12"
                  placeholder="गेहूं, दूध, सब्जी आदि"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddEarning(false)}
                  className="flex-1 h-12"
                >
                  रद्द करें
                </Button>
                <Button
                  onClick={addEarning}
                  className="flex-1 bg-green-500 hover:bg-green-600 h-12"
                >
                  जोड़ें
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
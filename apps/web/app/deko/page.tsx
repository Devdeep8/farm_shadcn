/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
"use client";
import React, { useState, useEffect, useCallback } from 'react';
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
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
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
  farmerId: string;
  amount: number;
  category: string;
  description?: string;
  cropName?: string;
  date: string;
}

interface Earning {
  id: number;
  farmerId: string;
  amount: number;
  source: string;
  description?: string;
  cropName?: string;
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
    picture: '',
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'earnings'>('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddEarning, setShowAddEarning] = useState(false);

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'बीज',
    description: '',
    cropName: '',
  });

  const [newEarning, setNewEarning] = useState({
    amount: '',
    source: '',
    description: '',
    cropName: '',
  });

  // Memoized loadUserData to fetch expenses and earnings
  const loadUserData = useCallback(async () => {
    if (!farmer.id) return;
    try {
      // Fetch expenses
      const expenseResponse = await fetch(`/api/expenses?farmerId=${farmer.id}`);
      if (!expenseResponse.ok) {
        const errorData = await expenseResponse.json();
        throw new Error(errorData.error || 'Failed to fetch expenses');
      }
      const expenseData = await expenseResponse.json();
      setExpenses(expenseData);

      // Fetch earnings
      const earningResponse = await fetch(`/api/earnings?farmerId=${farmer.id}`);
      if (!earningResponse.ok) {
        const errorData = await earningResponse.json();
        throw new Error(errorData.error || 'Failed to fetch earnings');
      }
      const earningData = await earningResponse.json();
      setEarnings(earningData);
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast.error(`डेटा लोड करने में त्रुटि: ${error.message || 'अज्ञात त्रुटि'}`);
    }
  }, [farmer.id]);

  // Initialize farmer data
  useEffect(() => {
    if (session?.user) {
      setFarmer({
        id: session.user.user_id || Date.now().toString(),
        name: session.user.name || 'किसान',
        village: 'गंगाखेड़ी',
        mobile: session.user.phone || '',
        email: session.user.email || '',
        picture: session.user.image || '',
      });
    }
  }, [session]);

  // Load data when farmer.id changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalEarnings = earnings.reduce((sum, earn) => sum + earn.amount, 0);
  const netProfit = totalEarnings - totalExpenses;

  const addExpense = useCallback(async () => {
    if (!newExpense.amount || !newExpense.category) {
      toast.error('कृपया राशि और श्रेणी दर्ज करें');
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer.id,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          description: newExpense.description || undefined,
          cropName: newExpense.cropName || undefined,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (response.ok) {
        const expense = await response.json();
        setExpenses((prev) => [expense, ...prev]);
        setNewExpense({ amount: '', category: 'बीज', description: '', cropName: '' });
        setShowAddExpense(false);
        toast.success('खर्च सफलतापूर्वक जोड़ा गया');
      } else {
        const errorData = await response.json();
        toast.error(`खर्च जोड़ने में त्रुटि: ${errorData.error || 'अज्ञात त्रुटि'}`);
      }
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(`खर्च जोड़ने में त्रुटि: ${error.message || 'अज्ञात त्रुटि'}`);
    }
  }, [farmer.id, newExpense]);

  const addEarning = useCallback(async () => {
    if (!newEarning.amount || !newEarning.source) {
      toast.error('कृपया राशि और स्रोत दर्ज करें');
      return;
    }

    try {
      const response = await fetch('/api/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer.id,
          amount: parseFloat(newEarning.amount),
          source: newEarning.source,
          description: newEarning.description || undefined,
          cropName: newEarning.cropName || undefined,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (response.ok) {
        const earning = await response.json();
        setEarnings((prev) => [earning, ...prev]);
        setNewEarning({ amount: '', source: '', description: '', cropName: '' });
        setShowAddEarning(false);
        toast.success('आय सफलतापूर्वक जोड़ा गया');
      } else {
        const errorData = await response.json();
        toast.error(`आय जोड़ने में त्रुटि: ${errorData.error || 'अज्ञात त्रुटि'}`);
      }
    } catch (error: any) {
      console.error('Error adding earning:', error);
      toast.error(`आय जोड़ने में त्रुटि: ${error.message || 'अज्ञात त्रुटि'}`);
    }
  }, [farmer.id, newEarning]);

  const deleteExpense = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/expenses?farmerId=${farmer.id}&id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete expense');
      }
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success('खर्च सफलतापूर्वक हटाया गया');
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error(`खर्च हटाने में त्रुटि: ${error.message || 'अज्ञात त्रुटि'}`);
    }
  }, [farmer.id]);

  const deleteEarning = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/earnings?farmerId=${farmer.id}&id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete earning');
      }
      setEarnings((prev) => prev.filter((e) => e.id !== id));
      toast.success('आय सफलतापूर्वक हटाया गया');
    } catch (error: any) {
      console.error('Error deleting earning:', error);
      toast.error(`आय हटाने में त्रुटि: ${error.message || 'अज्ञात त्रुटि'}`);
    }
  }, [farmer.id]);

  const handleSignIn = useCallback((provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' });
  }, []);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' });
  }, []);

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
              <Alert>
                <AlertDescription>सुरक्षित लॉगिन के लिए Google या GitHub चुनें</AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const DashboardView = React.memo(() => (
    <div className="space-y-6 p-4">
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
                    width={150}
                    height={150}
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold">नमस्ते, {farmer.name}</h1>
                <p className="text-green-100 text-sm">गांव: {farmer.village}</p>
                <p className="text-green-100 text-xs">{farmer.email}</p>
                {farmer.mobile && <p className="text-green-100 text-xs">{farmer.mobile}</p>}
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
  ));

  const ExpensesView = React.memo(() => (
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
                    {expense.description && (
                      <p className="text-sm text-gray-600">{expense.description}</p>
                    )}
                    {expense.cropName && (
                      <p className="text-sm text-gray-600">फसल: {expense.cropName}</p>
                    )}
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
  ));

  const EarningsView = React.memo(() => (
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
                    {earning.description && (
                      <p className="text-sm text-gray-600">{earning.description}</p>
                    )}
                    {earning.cropName && (
                      <p className="text-sm text-gray-600">फसल: {earning.cropName}</p>
                    )}
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
  ));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
        <div className="flex justify-between md:justify-around px-4 py-2 max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-blue-600' : ''}`} />
            <span>मुख्य</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              activeTab === 'expenses' ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingDown className={`w-5 h-5 ${activeTab === 'expenses' ? 'text-red-600' : ''}`} />
            <span>खर्च</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('earnings')}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              activeTab === 'earnings' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${activeTab === 'earnings' ? 'text-green-600' : ''}`} />
            <span>आय</span>
          </Button>
        </div>
      </nav>

      <div className="pb-20">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'expenses' && <ExpensesView />}
        {activeTab === 'earnings' && <EarningsView />}
      </div>

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
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="text-lg h-12"
                  placeholder="राशि दर्ज करें"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category" className="text-base">क्या खरीदा?</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
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
              <div className="space-y-2">
                <Label htmlFor="expense-description" className="text-base">विवरण (वैकल्पिक)</Label>
                <Input
                  id="expense-description"
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="text-lg h-12"
                  placeholder="विवरण दर्ज करें"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-cropName" className="text-base">फसल का नाम (वैकल्पिक)</Label>
                <Input
                  id="expense-cropName"
                  type="text"
                  value={newExpense.cropName}
                  onChange={(e) => setNewExpense({ ...newExpense, cropName: e.target.value })}
                  className="text-lg h-12"
                  placeholder="गेहूं, धान आदि"
                />
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
                  onChange={(e) => setNewEarning({ ...newEarning, amount: e.target.value })}
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
                  onChange={(e) => setNewEarning({ ...newEarning, source: e.target.value })}
                  className="text-lg h-12"
                  placeholder="गेहूं, दूध, सब्जी आदि"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="earning-description" className="text-base">विवरण (वैकल्पिक)</Label>
                <Input
                  id="earning-description"
                  type="text"
                  value={newEarning.description}
                  onChange={(e) => setNewEarning({ ...newEarning, description: e.target.value })}
                  className="text-lg h-12"
                  placeholder="विवरण दर्ज करें"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="earning-cropName" className="text-base">फसल का नाम (वैकल्पिक)</Label>
                <Input
                  id="earning-cropName"
                  type="text"
                  value={newEarning.cropName}
                  onChange={(e) => setNewEarning({ ...newEarning, cropName: e.target.value })}
                  className="text-lg h-12"
                  placeholder="गेहूं, धान आदि"
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
%%% Parameter initialization %%%

format long g % Defines the length of the data type

S = input('S = '); % Length of CubeSat stream
N = input('N = '); % Number of keys
D = input('D = '); % Key length
brz = round(rand(S,1));
acu = 0;
for s = 1:S
  acu = acu + brz(s);
end
y = acu/S;
x = 3.444+y/10^4;

K2 = [];
k2 = [];
Mk2 = [];
for n = 1:N
  x = x-floor(x);
  acuy = 0;
  acuk = 0;
  for c = 1:D
    y = floor(x*10^c)-acuy*10;
    acuy = acuy+y;
    if rem(y,2) == 0,
      k2(c) = 0;
    else
      k2(c) = 1;
    end
    acuk = acuk + k2(c)*2^(c-1);
  end
  Mk2(n,:) = k2;      % Matriz de claves en estado binario
  K2(n) = acuk;       % Vector de claves donde c/u se expresa como un número entero
  x = x*(pi-127/300); % Setting
end

%%% Showing the keys %%%
Mk2 = Mk2;

%%% Showing the randomness of the keys %%%
plot(1:1:N,K2,'k.')
axis([ 1 N min(K2) max(K2) ])
function [Pv, Lv] = dife(K2)

N = length(K2);
v = [];
v(1) = K2(1);
i = 1;
for n = 2:N
  k = 0;
  for j = 1:i
    if K2(n) ~= v(j),
      k = k+1;
    end
  end
  if k == i, 
    i = i+1;
    v(i) = K2(n);
  end
end
Lv = length(v);
Pv = Lv/N * 100;
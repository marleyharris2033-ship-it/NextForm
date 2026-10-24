// NextForm recipes: original recipes written for NextForm. Ingredient names match the everyday foods in
// common-foods.js, so calories and macros are worked out from the same numbers you log.
// [id, name, meal, minutes, serves, tags, ingredients [food, grams, note], steps]
// tags: veg (vegetarian), vegan, quick (20 min or less), prep (keeps well for meal prep), nocook
window.RECIPE_DATA = [
  // ---------------- Breakfast ----------------
  ['protein-porridge', 'Protein porridge with berries', 'Breakfast', 8, 1, 'veg quick', [
    ['Porridge oats', 50], ['Milk, semi-skimmed', 250, '250 ml'], ['Whey protein powder', 25, '1 scoop'], ['Frozen mixed berries', 80], ['Honey', 7, '1 tsp']],
    ['Simmer the oats and milk for 4–5 minutes, stirring, until thick.', 'Take off the heat and stir in the protein powder with a splash more milk if it gets too thick.', 'Top with the berries and honey.']],
  ['overnight-oats-pb', 'Peanut butter overnight oats', 'Breakfast', 5, 1, 'veg quick prep nocook', [
    ['Porridge oats', 50], ['Milk, skimmed', 150, '150 ml'], ['Greek yogurt, 0% fat', 100], ['Peanut butter', 15, '1 tbsp'], ['Banana', 60, '½ banana'], ['Chia seeds', 8, '2 tsp']],
    ['Mix the oats, milk, yogurt and chia seeds in a jar.', 'Swirl through the peanut butter, cover and chill overnight.', 'Slice the banana on top in the morning.']],
  ['chocolate-overnight-oats', 'Chocolate protein overnight oats', 'Breakfast', 5, 1, 'veg quick prep nocook', [
    ['Porridge oats', 50], ['Milk, skimmed', 180, '180 ml'], ['Whey protein powder', 25, '1 scoop'], ['Cocoa powder', 8, '2 tsp'], ['Raspberries', 60]],
    ['Stir the oats, milk, protein powder and cocoa together until smooth.', 'Cover and chill overnight (or at least 2 hours).', 'Top with raspberries.']],
  ['spinach-feta-omelette', 'Spinach and feta omelette', 'Breakfast', 10, 1, 'veg quick', [
    ['Egg, whole', 150, '3 large'], ['Spinach, raw', 40, '2 handfuls'], ['Feta', 30], ['Tomatoes', 85, '1 tomato'], ['Olive oil', 5, '1 tsp']],
    ['Wilt the spinach in a non-stick pan with the oil.', 'Pour in the beaten eggs, swirl, and cook until almost set.', 'Crumble over the feta, fold in half and serve with sliced tomato.']],
  ['egg-white-scramble', 'Egg white scramble on toast', 'Breakfast', 10, 1, 'veg quick', [
    ['Egg white', 165, '5 whites'], ['Egg, whole', 50, '1 large'], ['Wholemeal bread', 80, '2 slices'], ['Mushrooms', 60], ['Spinach, raw', 30]],
    ['Fry the mushrooms in a dry non-stick pan until golden, then add the spinach.', 'Add the beaten egg whites and egg, and stir gently over a low heat until just set.', 'Serve on the toast.']],
  ['smoked-salmon-bagel', 'Smoked salmon and cream cheese bagel', 'Breakfast', 5, 1, 'quick nocook', [
    ['Bagel, plain', 85, '1 bagel'], ['Light cream cheese', 30], ['Smoked salmon', 60], ['Cucumber', 30], ['Lemon juice', 5]],
    ['Toast the bagel.', 'Spread with cream cheese, then top with smoked salmon and cucumber.', 'Squeeze over a little lemon.']],
  ['greek-yogurt-bowl', 'Greek yogurt power bowl', 'Breakfast', 3, 1, 'veg quick nocook', [
    ['Greek yogurt, 0% fat', 250], ['Granola', 30], ['Blueberries', 80], ['Honey', 10, '2 tsp'], ['Almonds', 10]],
    ['Spoon the yogurt into a bowl.', 'Top with granola, blueberries, chopped almonds and honey.']],
  ['protein-pancakes', 'Banana protein pancakes', 'Breakfast', 15, 1, 'veg quick', [
    ['Banana', 100, '1 small'], ['Egg, whole', 100, '2 large'], ['Porridge oats', 40], ['Whey protein powder', 25, '1 scoop'], ['Greek yogurt, 0% fat', 80], ['Maple syrup', 10, '2 tsp']],
    ['Blend the banana, eggs, oats and protein powder into a batter.', 'Cook small pancakes in a non-stick pan for 1–2 minutes each side.', 'Serve with yogurt and maple syrup.']],
  ['breakfast-burrito', 'Breakfast burrito', 'Breakfast', 12, 1, 'quick', [
    ['Tortilla wrap', 62, '1 wrap'], ['Egg, whole', 100, '2 large'], ['Black beans, tinned, drained', 60], ['Cheddar cheese', 20], ['Salsa', 40], ['Red pepper', 50]],
    ['Soften the chopped pepper in a non-stick pan, then add the beans to warm through.', 'Add the beaten eggs and scramble.', 'Fill the wrap with the eggs, cheese and salsa, and roll up.']],
  ['beans-on-toast-egg', 'Beans on toast with a poached egg', 'Breakfast', 10, 1, 'veg quick', [
    ['Baked beans', 200, '½ tin'], ['Wholemeal bread', 80, '2 slices'], ['Egg, whole', 50, '1 large']],
    ['Warm the beans and toast the bread.', 'Poach the egg in simmering water for 3 minutes.', 'Pile the beans on the toast and top with the egg.']],
  ['cottage-cheese-toast', 'Cottage cheese, tomato and avocado toast', 'Breakfast', 5, 1, 'veg quick', [
    ['Wholemeal bread', 80, '2 slices'], ['Cottage cheese', 150], ['Avocado', 40], ['Tomatoes', 85, '1 tomato']],
    ['Toast the bread.', 'Spread with cottage cheese, then top with sliced avocado and tomato.', 'Season with black pepper.']],
  ['weetabix-protein', 'Weetabix with protein milk and banana', 'Breakfast', 3, 1, 'veg quick nocook', [
    ['Weetabix', 37.5, '2 biscuits'], ['Milk, semi-skimmed', 200, '200 ml'], ['Whey protein powder', 25, '1 scoop'], ['Banana', 100, '1 small']],
    ['Shake the protein powder into the milk.', 'Pour over the Weetabix and top with sliced banana.']],
  ['berry-smoothie', 'Berry protein smoothie', 'Breakfast', 5, 1, 'veg quick nocook', [
    ['Frozen mixed berries', 120], ['Banana', 80], ['Whey protein powder', 30, '1 scoop'], ['Milk, skimmed', 250, '250 ml'], ['Porridge oats', 20]],
    ['Blend everything until smooth. Add a splash of water if it’s too thick.']],
  ['pb-banana-smoothie', 'Peanut butter banana smoothie', 'Breakfast', 5, 1, 'veg quick nocook', [
    ['Banana', 120, '1 banana'], ['Peanut butter', 15, '1 tbsp'], ['Whey protein powder', 30, '1 scoop'], ['Milk, semi-skimmed', 250, '250 ml'], ['Porridge oats', 20]],
    ['Blend everything with a few ice cubes until smooth.']],
  ['egg-muffins', 'Egg muffins (makes 6)', 'Breakfast', 25, 3, 'veg prep', [
    ['Egg, whole', 300, '6 large'], ['Red pepper', 80], ['Spinach, raw', 40], ['Spring onions', 30], ['Cheddar cheese', 40]],
    ['Heat the oven to 190°C (fan 170°C) and grease a 6-hole muffin tin.', 'Divide the chopped veg and cheese between the holes.', 'Pour over the beaten eggs and bake for 18–20 minutes. Keeps 3 days in the fridge (2 muffins a serving).']],
  ['skyr-granola', 'Skyr with granola and raspberries', 'Breakfast', 3, 1, 'veg quick nocook', [
    ['Skyr, natural', 200], ['Granola', 35], ['Raspberries', 80], ['Honey', 7, '1 tsp']],
    ['Layer the skyr, granola and raspberries in a bowl or jar, and drizzle with honey.']],
  ['full-english-lighter', 'Lighter full English', 'Breakfast', 20, 1, 'quick', [
    ['Back bacon, grilled', 50, '2 rashers'], ['Egg, whole', 100, '2 large'], ['Baked beans', 150], ['Mushrooms', 80], ['Tomatoes', 85, '1 tomato'], ['Wholemeal bread', 40, '1 slice']],
    ['Grill the bacon and halved tomato.', 'Dry-fry the mushrooms and poach the eggs.', 'Warm the beans and serve everything with the toast.']],
  ['tofu-scramble', 'Turmeric tofu scramble', 'Breakfast', 12, 1, 'vegan quick', [
    ['Tofu, firm', 200], ['Spinach, raw', 40], ['Red pepper', 60], ['Wholemeal bread', 40, '1 slice'], ['Olive oil', 5, '1 tsp'], ['Spice mix', 2, '½ tsp turmeric and cumin']],
    ['Soften the pepper in the oil, then crumble in the tofu and spices.', 'Cook for 5 minutes, then stir through the spinach until wilted.', 'Serve on toast.']],

  // ---------------- Lunch ----------------
  ['chicken-caesar-wrap', 'Chicken Caesar wrap', 'Lunch', 10, 1, 'quick', [
    ['Tortilla wrap', 62, '1 wrap'], ['Chicken breast, cooked', 120], ['Salad leaves', 40], ['Light mayonnaise', 15, '1 tbsp'], ['Parmesan', 8], ['Lemon juice', 5]],
    ['Mix the mayo, lemon and parmesan.', 'Fill the wrap with leaves and sliced chicken, spoon over the dressing and roll up.']],
  ['tuna-pasta-salad', 'Tuna and sweetcorn pasta salad', 'Lunch', 15, 2, 'quick prep', [
    ['Pasta, uncooked', 150], ['Tuna in spring water, drained', 224, '2 tins'], ['Sweetcorn', 100], ['Light mayonnaise', 45, '3 tbsp'], ['Red pepper', 80], ['Spring onions', 30]],
    ['Cook the pasta, then rinse under cold water and drain.', 'Mix with the tuna, sweetcorn, chopped pepper, spring onions and mayo.', 'Keeps 2 days in the fridge.']],
  ['chicken-rice-bowl', 'Teriyaki-style chicken rice bowl', 'Lunch', 20, 2, 'quick prep', [
    ['Chicken breast, raw', 300, '2 breasts'], ['Rice, uncooked', 150], ['Soy sauce', 30, '2 tbsp'], ['Honey', 15, '1 tbsp'], ['Broccoli, boiled', 160], ['Spring onions', 20], ['Ginger', 5]],
    ['Cook the rice.', 'Fry the sliced chicken until cooked through, then add the soy, honey, ginger and a splash of water and bubble until sticky.', 'Serve over the rice with broccoli and spring onions.']],
  ['greek-chicken-salad', 'Greek chicken salad', 'Lunch', 10, 1, 'quick', [
    ['Chicken breast, cooked', 120], ['Salad leaves', 50], ['Cucumber', 80], ['Tomatoes', 120], ['Feta', 30], ['Olive oil', 7, '½ tbsp'], ['Lemon juice', 10]],
    ['Chop the cucumber and tomatoes and toss with the leaves.', 'Top with the chicken and crumbled feta.', 'Dress with the oil and lemon.']],
  ['hummus-falafel-pitta', 'Chickpea, hummus and salad pitta', 'Lunch', 8, 1, 'vegan quick', [
    ['Wholemeal pitta', 60, '1 pitta'], ['Hummus', 50], ['Chickpeas, cooked', 80], ['Salad leaves', 30], ['Tomatoes', 60], ['Cucumber', 40], ['Paprika', 1]],
    ['Toast the pitta and split it open.', 'Toss the chickpeas with paprika.', 'Spread hummus inside and fill with the chickpeas and salad.']],
  ['quinoa-salmon-bowl', 'Salmon, quinoa and edamame bowl', 'Lunch', 20, 1, 'quick', [
    ['Salmon fillet, raw', 120, '1 fillet'], ['Quinoa, cooked', 150], ['Frozen edamame', 60], ['Cucumber', 50], ['Soy sauce', 10], ['Lime juice', 10]],
    ['Bake the salmon at 200°C (fan 180°C) for 12–15 minutes.', 'Cook the edamame in boiling water for 3 minutes.', 'Build the bowl with quinoa, edamame and cucumber, top with salmon and drizzle with soy and lime.']],
  ['turkey-club', 'Turkey club sandwich', 'Lunch', 5, 1, 'quick nocook', [
    ['Wholemeal bread', 80, '2 slices'], ['Turkey breast, cooked', 80], ['Ham, sliced', 30], ['Salad leaves', 20], ['Tomatoes', 50], ['Light mayonnaise', 10]],
    ['Spread the bread with mayo.', 'Layer with turkey, ham, leaves and tomato.']],
  ['egg-mayo-sandwich', 'High-protein egg mayo sandwich', 'Lunch', 12, 1, 'veg quick', [
    ['Wholemeal bread', 80, '2 slices'], ['Egg, whole', 100, '2 large'], ['Greek yogurt, 0% fat', 30], ['Light mayonnaise', 10], ['Salad leaves', 20]],
    ['Hard-boil the eggs for 9 minutes, cool and peel.', 'Mash with the yogurt and mayo, and season.', 'Fill the sandwich with the egg mix and leaves.']],
  ['lentil-soup', 'Red lentil and carrot soup', 'Lunch', 30, 4, 'vegan prep', [
    ['Red lentils, dry', 200], ['Carrots, boiled', 300], ['Onion', 150, '1 onion'], ['Garlic', 8, '2 cloves'], ['Stock cube', 10, '1 cube'], ['Olive oil', 10, '2 tsp'], ['Spice mix', 5, '1 tsp cumin']],
    ['Soften the onion and garlic in the oil.', 'Add the chopped carrots, lentils, cumin and 1.2 litres of stock.', 'Simmer for 20 minutes, then blend. Freezes well.']],
  ['chicken-noodle-soup', 'Chicken noodle soup', 'Lunch', 25, 2, 'prep', [
    ['Chicken breast, raw', 250], ['Egg noodles, cooked', 200], ['Carrots, boiled', 100], ['Spring onions', 30], ['Stock cube', 10, '1 cube'], ['Soy sauce', 15], ['Ginger', 5]],
    ['Bring 800 ml stock to a simmer with the ginger and soy.', 'Add the chicken and sliced carrots and poach for 12 minutes, then shred the chicken.', 'Add the noodles and spring onions to warm through.']],
  ['prawn-noodle-salad', 'Sweet chilli prawn noodle salad', 'Lunch', 10, 1, 'quick', [
    ['Prawns, cooked', 120], ['Egg noodles, cooked', 150], ['Cucumber', 60], ['Red pepper', 60], ['Sweet chilli sauce', 20], ['Lime juice', 10]],
    ['Toss the noodles with sliced veg.', 'Mix the sweet chilli and lime and pour over.', 'Top with prawns.']],
  ['jacket-tuna', 'Jacket potato with tuna and sweetcorn', 'Lunch', 10, 1, 'quick', [
    ['Jacket potato', 220, '1 medium'], ['Tuna in spring water, drained', 112, '1 tin'], ['Sweetcorn', 50], ['Greek yogurt, 0% fat', 40], ['Salad leaves', 30]],
    ['Microwave the potato for 8–10 minutes, turning halfway (or bake for an hour).', 'Mix the tuna, sweetcorn and yogurt.', 'Split the potato and fill. Serve with leaves.']],
  ['jacket-beans-cheese', 'Jacket potato with beans and cheese', 'Lunch', 10, 1, 'veg quick', [
    ['Jacket potato', 220, '1 medium'], ['Baked beans', 200, '½ tin'], ['Cheddar cheese', 25]],
    ['Microwave the potato for 8–10 minutes.', 'Warm the beans, pour over the potato and top with grated cheese.']],
  ['halloumi-couscous', 'Halloumi and roast veg couscous', 'Lunch', 25, 2, 'veg prep', [
    ['Halloumi', 120], ['Couscous, cooked', 300], ['Courgette', 200], ['Red pepper', 160], ['Olive oil', 10], ['Lemon juice', 15]],
    ['Roast the chopped courgette and pepper with the oil at 200°C (fan 180°C) for 20 minutes.', 'Griddle or fry the sliced halloumi until golden.', 'Toss the couscous with the veg and lemon, and top with halloumi.']],
  ['chicken-avocado-salad', 'Chicken, avocado and quinoa salad', 'Lunch', 10, 1, 'quick', [
    ['Chicken breast, cooked', 120], ['Quinoa, cooked', 100], ['Avocado', 50], ['Tomatoes', 80], ['Salad leaves', 30], ['Lime juice', 10]],
    ['Toss everything together and season with salt, pepper and lime.']],
  ['cottage-cheese-rice-cakes', 'Rice cakes with cottage cheese and ham', 'Lunch', 3, 1, 'quick nocook', [
    ['Rice cakes', 36, '4 cakes'], ['Cottage cheese', 150], ['Ham, sliced', 45], ['Cucumber', 40]],
    ['Top the rice cakes with cottage cheese, ham and sliced cucumber.']],
  ['tofu-poke', 'Tofu poke bowl', 'Lunch', 15, 1, 'vegan quick', [
    ['Tofu, firm', 150], ['White rice, cooked', 150], ['Frozen edamame', 50], ['Cucumber', 50], ['Avocado', 40], ['Soy sauce', 15], ['Lime juice', 5]],
    ['Press the tofu dry, cube it and fry until crisp. Toss in half the soy.', 'Cook the edamame for 3 minutes.', 'Build the bowl and drizzle with the rest of the soy and lime.']],

  // ---------------- Dinner ----------------
  ['chilli-con-carne', 'Lean chilli con carne', 'Dinner', 40, 4, 'prep', [
    ['Beef mince, 5% fat, raw', 500], ['Kidney beans, tinned, drained', 240, '1 tin'], ['Chopped tomatoes, tinned', 400, '1 tin'], ['Onion', 150], ['Red pepper', 160], ['Garlic', 8], ['Spice mix', 10, '2 tsp chilli and cumin'], ['Rice, uncooked', 300]],
    ['Brown the mince, then add the chopped onion, pepper and garlic and cook for 5 minutes.', 'Add the spices, tomatoes, beans and a splash of water, and simmer for 25 minutes.', 'Serve with rice. Freezes well.']],
  ['spag-bol', 'Spaghetti bolognese', 'Dinner', 35, 4, 'prep', [
    ['Beef mince, 5% fat, raw', 500], ['Passata', 500], ['Onion', 150], ['Carrots, boiled', 100], ['Mushrooms', 150], ['Garlic', 8], ['Pasta, uncooked', 300], ['Parmesan', 20]],
    ['Brown the mince, then add the onion, grated carrot, mushrooms and garlic.', 'Pour in the passata and simmer for 20 minutes.', 'Serve with spaghetti and a little parmesan.']],
  ['chicken-fajitas', 'Chicken fajitas', 'Dinner', 20, 2, 'quick', [
    ['Chicken breast, raw', 300, '2 breasts'], ['Red pepper', 160], ['Onion', 100], ['Spice mix', 10, '2 tsp fajita seasoning'], ['Tortilla wrap', 248, '4 wraps'], ['Salsa', 80], ['Greek yogurt, 0% fat', 80]],
    ['Slice the chicken, pepper and onion and toss with the seasoning.', 'Fry in a hot pan for 8–10 minutes until the chicken is cooked.', 'Serve in warm wraps with salsa and yogurt.']],
  ['salmon-sweet-potato', 'Baked salmon, sweet potato and greens', 'Dinner', 30, 1, '', [
    ['Salmon fillet, raw', 130, '1 fillet'], ['Sweet potato, baked', 200], ['Green beans', 100], ['Lemon juice', 10], ['Olive oil', 5]],
    ['Bake the sweet potato wedges with the oil at 200°C (fan 180°C) for 25 minutes.', 'Add the salmon for the last 12–15 minutes.', 'Boil the green beans and serve with lemon.']],
  ['chicken-tikka-lighter', 'Lighter chicken tikka masala', 'Dinner', 35, 4, 'prep', [
    ['Chicken breast, raw', 600], ['Curry paste', 60, '4 tbsp tikka paste'], ['Chopped tomatoes, tinned', 400], ['Greek yogurt, 0% fat', 150], ['Onion', 150], ['Rice, uncooked', 300], ['Spinach, raw', 80]],
    ['Soften the onion, then add the paste and cubed chicken and cook for 5 minutes.', 'Add the tomatoes and simmer for 15 minutes. Stir in the spinach.', 'Take off the heat and stir in the yogurt. Serve with rice.']],
  ['beef-stir-fry', 'Beef and broccoli stir-fry', 'Dinner', 15, 2, 'quick', [
    ['Beef stir-fry strips, raw', 250], ['Broccoli, boiled', 200], ['Red pepper', 100], ['Soy sauce', 30], ['Garlic', 8], ['Ginger', 5], ['Egg noodles, cooked', 300]],
    ['Stir-fry the beef in a very hot pan for 2 minutes, then remove.', 'Fry the veg, garlic and ginger for 4 minutes.', 'Return the beef, add the soy and noodles, and toss until hot.']],
  ['turkey-meatballs', 'Turkey meatballs in tomato sauce', 'Dinner', 35, 4, 'prep', [
    ['Turkey mince, 5% fat, raw', 500], ['Porridge oats', 30], ['Egg, whole', 50], ['Passata', 500], ['Garlic', 8], ['Onion', 100], ['Pasta, uncooked', 300], ['Parmesan', 20]],
    ['Mix the mince, oats, egg and half the chopped onion, and roll into 20 balls.', 'Brown them in a pan, then add the rest of the onion, the garlic and the passata.', 'Simmer for 15 minutes and serve with pasta and parmesan.']],
  ['cod-traybake', 'Lemon cod and potato traybake', 'Dinner', 35, 2, '', [
    ['Cod, raw', 280, '2 fillets'], ['Potatoes, boiled', 400], ['Tomatoes', 170], ['Green beans', 160], ['Olive oil', 10], ['Lemon juice', 15]],
    ['Roast the sliced potatoes with the oil at 200°C (fan 180°C) for 20 minutes.', 'Add the cod, tomatoes and green beans, squeeze over lemon and roast for 12 more minutes.']],
  ['veggie-chilli', 'Three-bean veggie chilli', 'Dinner', 30, 4, 'vegan prep', [
    ['Kidney beans, tinned, drained', 240], ['Black beans, tinned, drained', 240], ['Chickpeas, cooked', 240], ['Chopped tomatoes, tinned', 800, '2 tins'], ['Onion', 150], ['Red pepper', 160], ['Spice mix', 10], ['Brown rice, cooked', 600]],
    ['Soften the onion and pepper, then add the spices.', 'Add the beans, chickpeas and tomatoes and simmer for 20 minutes.', 'Serve with brown rice.']],
  ['chicken-pesto-pasta', 'Chicken pesto pasta', 'Dinner', 20, 2, 'quick', [
    ['Pasta, uncooked', 150], ['Chicken breast, raw', 300], ['Pesto', 30, '2 tbsp'], ['Tomatoes', 120], ['Spinach, raw', 60], ['Parmesan', 10]],
    ['Cook the pasta.', 'Fry the sliced chicken until cooked, then add the tomatoes and spinach.', 'Toss with the pasta and pesto, and top with parmesan.']],
  ['thai-green-curry', 'Thai green chicken curry', 'Dinner', 25, 3, 'prep', [
    ['Chicken breast, raw', 450], ['Curry paste', 45, '3 tbsp green curry paste'], ['Light coconut milk', 400, '1 tin'], ['Green beans', 150], ['Red pepper', 100], ['Rice, uncooked', 225]],
    ['Fry the paste for a minute, then add the sliced chicken.', 'Pour in the coconut milk, add the veg and simmer for 12 minutes.', 'Serve with rice.']],
  ['prawn-stir-fry', 'Garlic prawn stir-fry', 'Dinner', 12, 2, 'quick', [
    ['Prawns, cooked', 250], ['Egg noodles, cooked', 300], ['Red pepper', 100], ['Broccoli, boiled', 150], ['Garlic', 12], ['Soy sauce', 30], ['Spring onions', 20]],
    ['Stir-fry the garlic and veg for 4 minutes.', 'Add the prawns, noodles and soy and toss until hot.', 'Top with spring onions.']],
  ['steak-chips', 'Steak, oven chips and peas', 'Dinner', 30, 1, '', [
    ['Sirloin steak, cooked', 170, '1 steak'], ['Oven chips', 150], ['Peas, boiled', 80], ['Mushrooms', 80]],
    ['Bake the chips as the packet says.', 'Sear the steak in a hot pan for 2–4 minutes each side, then rest it.', 'Fry the mushrooms in the same pan and serve with peas.']],
  ['dahl', 'Red lentil and spinach dahl', 'Dinner', 30, 4, 'vegan prep', [
    ['Red lentils, dry', 250], ['Light coconut milk', 200], ['Chopped tomatoes, tinned', 400], ['Onion', 150], ['Garlic', 8], ['Ginger', 10], ['Curry paste', 30], ['Spinach, raw', 100], ['Brown rice, cooked', 600]],
    ['Soften the onion, garlic and ginger, then stir in the paste.', 'Add the lentils, tomatoes, coconut milk and 500 ml water and simmer for 20 minutes.', 'Stir in the spinach and serve with rice.']],
  ['pork-stir-fry', 'Sticky pork and veg rice', 'Dinner', 20, 2, 'quick', [
    ['Lean pork steak, raw', 300], ['Rice, uncooked', 150], ['Soy sauce', 30], ['Honey', 15], ['Red pepper', 100], ['Green beans', 100], ['Garlic', 8]],
    ['Cook the rice.', 'Fry the sliced pork until browned, then add the veg and garlic for 4 minutes.', 'Add the soy and honey and bubble until sticky. Serve over rice.']],
  ['shepherds-pie', 'Lighter cottage pie', 'Dinner', 60, 4, 'prep', [
    ['Beef mince, 5% fat, raw', 500], ['Potatoes, boiled', 800], ['Carrots, boiled', 150], ['Onion', 150], ['Peas, boiled', 100], ['Stock cube', 10], ['Milk, skimmed', 80], ['Cheddar cheese', 30]],
    ['Brown the mince with the onion and carrot, add the stock and peas and simmer for 15 minutes.', 'Mash the boiled potatoes with the milk.', 'Top the mince with mash and cheese and bake at 200°C (fan 180°C) for 25 minutes.']],
  ['chicken-burrito-bowl', 'Chicken burrito bowl', 'Dinner', 25, 2, 'prep', [
    ['Chicken breast, raw', 300], ['Rice, uncooked', 120], ['Black beans, tinned, drained', 120], ['Sweetcorn', 80], ['Salsa', 80], ['Avocado', 60], ['Spice mix', 6], ['Lime juice', 10]],
    ['Cook the rice and stir in the lime.', 'Season the chicken and fry or grill until cooked, then slice.', 'Build bowls with rice, beans, sweetcorn, chicken, salsa and avocado.']],
  ['salmon-teriyaki-noodles', 'Teriyaki salmon noodles', 'Dinner', 20, 2, 'quick', [
    ['Salmon fillet, raw', 240, '2 fillets'], ['Egg noodles, cooked', 300], ['Broccoli, boiled', 150], ['Soy sauce', 30], ['Honey', 15], ['Ginger', 5]],
    ['Bake the salmon at 200°C (fan 180°C) for 12 minutes, brushing with half the soy and honey.', 'Stir-fry the broccoli, then add the noodles, ginger and the rest of the sauce.', 'Serve topped with the salmon.']],
  ['halloumi-fajitas', 'Halloumi fajitas', 'Dinner', 20, 2, 'veg quick', [
    ['Halloumi', 160], ['Red pepper', 160], ['Onion', 100], ['Spice mix', 8], ['Tortilla wrap', 248, '4 wraps'], ['Salsa', 80], ['Greek yogurt, 0% fat', 80]],
    ['Fry the sliced pepper and onion with the seasoning for 6 minutes.', 'Fry the halloumi strips until golden.', 'Serve in wraps with salsa and yogurt.']],
  ['chicken-traybake', 'Chorizo chicken traybake', 'Dinner', 40, 4, 'prep', [
    ['Chicken thigh, cooked, skinless', 480], ['Chorizo', 60], ['Potatoes, boiled', 600], ['Red pepper', 240], ['Onion', 150], ['Olive oil', 10], ['Paprika', 3]],
    ['Toss everything in a roasting tin with the oil and paprika.', 'Roast at 200°C (fan 180°C) for 35 minutes, turning once.']],
  ['tofu-stir-fry', 'Crispy tofu and veg stir-fry', 'Dinner', 20, 2, 'vegan quick', [
    ['Tofu, firm', 300], ['Egg noodles, cooked', 300], ['Broccoli, boiled', 150], ['Red pepper', 100], ['Soy sauce', 30], ['Sweet chilli sauce', 20], ['Olive oil', 10]],
    ['Press, cube and fry the tofu in the oil until crisp.', 'Add the veg and stir-fry for 4 minutes.', 'Add the noodles, soy and sweet chilli and toss.']],
  ['jerk-chicken-rice', 'Spiced chicken, rice and peas', 'Dinner', 35, 2, 'prep', [
    ['Chicken thigh, cooked, skinless', 240], ['Rice, uncooked', 150], ['Kidney beans, tinned, drained', 120], ['Light coconut milk', 100], ['Spice mix', 8], ['Spring onions', 30]],
    ['Rub the chicken with the spice and grill or bake until cooked.', 'Cook the rice with the coconut milk and water (about 300 ml in total), adding the beans for the last 5 minutes.', 'Serve topped with spring onions.']],
  ['pasta-arrabbiata-prawn', 'Prawn arrabbiata', 'Dinner', 20, 2, 'quick', [
    ['Pasta, uncooked', 160], ['Prawns, cooked', 200], ['Passata', 300], ['Garlic', 8], ['Spice mix', 2, 'pinch of chilli flakes'], ['Olive oil', 7]],
    ['Cook the pasta.', 'Fry the garlic and chilli in the oil, add the passata and simmer for 8 minutes.', 'Add the prawns to warm through and toss with the pasta.']],
  ['mince-burrito', 'Beef burrito wraps', 'Dinner', 25, 4, '', [
    ['Beef mince, 5% fat, raw', 400], ['Black beans, tinned, drained', 240], ['Tortilla wrap', 248, '4 wraps'], ['Cheddar cheese', 60], ['Salsa', 120], ['Spice mix', 10], ['Salad leaves', 60]],
    ['Brown the mince with the seasoning, then add the beans and a splash of water.', 'Fill the wraps with the mince, cheese, salsa and leaves, and roll up.']],
  ['gnocchi-style-potato-bake', 'Cheesy tomato and bean bake', 'Dinner', 30, 3, 'veg', [
    ['Potatoes, boiled', 500], ['Chopped tomatoes, tinned', 400], ['Chickpeas, cooked', 240], ['Spinach, raw', 80], ['Mozzarella', 125, '1 ball'], ['Garlic', 8]],
    ['Simmer the tomatoes, garlic and chickpeas for 10 minutes and stir in the spinach.', 'Add the cubed potatoes, top with torn mozzarella and bake at 200°C (fan 180°C) for 15 minutes.']],
  ['chicken-katsu', 'Baked chicken katsu curry', 'Dinner', 35, 2, '', [
    ['Chicken breast, raw', 300], ['White bread', 40, '1 slice, blitzed to crumbs'], ['Egg, whole', 50], ['Curry paste', 30], ['Light coconut milk', 150], ['Carrots, boiled', 100], ['Rice, uncooked', 150]],
    ['Dip the flattened chicken in egg, then crumbs, and bake at 200°C (fan 180°C) for 20 minutes.', 'Simmer the paste, coconut milk and grated carrot for 10 minutes, then blend.', 'Serve the sliced chicken over rice with the sauce.']],
  ['fish-tacos', 'Fish tacos with lime slaw', 'Dinner', 20, 2, 'quick', [
    ['Cod, raw', 280], ['Tortilla wrap', 124, '2 wraps, cut into 4 small rounds'], ['Cucumber', 60], ['Carrots, boiled', 60], ['Greek yogurt, 0% fat', 80], ['Lime juice', 15], ['Spice mix', 5]],
    ['Season the cod and bake at 200°C (fan 180°C) for 10 minutes, then flake.', 'Shred the carrot and cucumber and mix with lime.', 'Fill the tortillas with fish, slaw and yogurt.']],

  // ---------------- Snacks ----------------
  ['protein-shake-banana', 'Protein shake and banana', 'Snacks', 2, 1, 'veg quick nocook', [
    ['Whey protein powder', 30, '1 scoop'], ['Milk, skimmed', 300, '300 ml'], ['Banana', 100, '1 small']],
    ['Shake the protein powder with the milk. Eat the banana alongside.']],
  ['apple-pb', 'Apple with peanut butter', 'Snacks', 2, 1, 'vegan quick nocook', [
    ['Apple', 180, '1 apple'], ['Peanut butter', 20]],
    ['Slice the apple and dip in the peanut butter.']],
  ['cottage-cheese-pineapple', 'Cottage cheese and pineapple', 'Snacks', 2, 1, 'veg quick nocook', [
    ['Cottage cheese', 200], ['Pineapple', 80]],
    ['Top the cottage cheese with chopped pineapple.']],
  ['hummus-veg', 'Hummus and veg sticks', 'Snacks', 5, 1, 'vegan quick nocook', [
    ['Hummus', 60], ['Carrots, boiled', 80, 'raw sticks'], ['Cucumber', 80], ['Red pepper', 80]],
    ['Cut the veg into sticks and dip.']],
  ['protein-yogurt-berries', 'Protein yogurt with berries', 'Snacks', 2, 1, 'veg quick nocook', [
    ['Protein yogurt, flavoured', 200, '1 pot'], ['Blueberries', 60]],
    ['Top the yogurt with blueberries.']],
  ['boiled-eggs', 'Two boiled eggs and rice cakes', 'Snacks', 10, 1, 'veg quick', [
    ['Egg, whole', 100, '2 large'], ['Rice cakes', 18, '2 cakes']],
    ['Boil the eggs for 7–9 minutes, cool and peel. Serve with the rice cakes.']],
  ['energy-balls', 'Peanut butter oat energy balls (makes 12)', 'Snacks', 15, 6, 'veg prep nocook', [
    ['Porridge oats', 100], ['Peanut butter', 80], ['Honey', 40], ['Whey protein powder', 30], ['Dark chocolate, 70%', 20], ['Chia seeds', 10]],
    ['Mix everything (chop the chocolate) into a stiff dough. Add a splash of milk if it’s dry.', 'Roll into 12 balls and chill for 30 minutes. Keeps a week in the fridge (2 balls a serving).']],
  ['date-coconut-bites', 'Date and coconut bites (makes 10)', 'Snacks', 10, 5, 'vegan prep nocook', [
    ['Medjool dates', 120, '5 dates'], ['Almonds', 60], ['Desiccated coconut', 20], ['Cocoa powder', 10]],
    ['Blitz the dates, almonds and cocoa in a food processor until sticky.', 'Roll into 10 balls and coat in coconut (2 bites a serving).']],
  ['tuna-rice-cakes', 'Tuna mayo rice cakes', 'Snacks', 3, 1, 'quick nocook', [
    ['Rice cakes', 27, '3 cakes'], ['Tuna in spring water, drained', 112, '1 tin'], ['Light mayonnaise', 10], ['Cucumber', 30]],
    ['Mix the tuna with the mayo and pile onto the rice cakes with cucumber.']],
  ['frozen-yogurt-bark', 'Frozen yogurt berry bark', 'Snacks', 10, 4, 'veg prep', [
    ['Greek yogurt, 0% fat', 400], ['Frozen mixed berries', 120], ['Honey', 20], ['Dark chocolate, 70%', 20]],
    ['Mix the yogurt and honey and spread on a lined tray.', 'Scatter with berries and grated chocolate and freeze for 3 hours. Break into pieces.']],
  ['edamame-snack', 'Salted edamame', 'Snacks', 5, 1, 'vegan quick', [
    ['Frozen edamame', 120]],
    ['Boil for 3 minutes, drain and sprinkle with a pinch of sea salt.']],
  ['chocolate-mug-cake', 'Chocolate protein mug cake', 'Snacks', 5, 1, 'veg quick', [
    ['Whey protein powder', 30], ['Porridge oats', 20], ['Cocoa powder', 8], ['Egg, whole', 50], ['Milk, skimmed', 40]],
    ['Mix everything in a large mug until smooth.', 'Microwave for 60–90 seconds until risen. Let it stand for a minute.']],
  ['skyr-chocolate-mousse', 'Chocolate skyr mousse', 'Snacks', 3, 1, 'veg quick nocook', [
    ['Skyr, natural', 200], ['Cocoa powder', 10], ['Maple syrup', 10], ['Raspberries', 40]],
    ['Whisk the skyr, cocoa and maple syrup until smooth.', 'Top with raspberries.']],
  ['trail-mix', 'Homemade trail mix', 'Snacks', 2, 4, 'vegan prep nocook', [
    ['Almonds', 60], ['Mixed nuts', 40], ['Dark chocolate, 70%', 30], ['Medjool dates', 48, '2 dates']],
    ['Chop the dates and chocolate, mix with the nuts and split into 4 bags.']],
  ['ham-cheese-roll-ups', 'Ham and cheese roll-ups', 'Snacks', 3, 1, 'quick nocook', [
    ['Ham, sliced', 60], ['Light cream cheese', 30], ['Cucumber', 40]],
    ['Spread the ham with cream cheese, add a cucumber stick and roll up.']],
  ['banana-oat-cookies', 'Banana oat cookies (makes 10)', 'Snacks', 20, 5, 'vegan prep', [
    ['Banana', 200, '2 ripe bananas'], ['Porridge oats', 120], ['Dark chocolate, 70%', 30], ['Cinnamon', 2]],
    ['Mash the bananas and mix with the oats, cinnamon and chopped chocolate.', 'Spoon 10 mounds onto a lined tray and bake at 180°C (fan 160°C) for 15 minutes (2 cookies a serving).']]
];

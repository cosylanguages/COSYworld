# Scene Image Prompts

These prompts are for the scenes that do not yet have a local image. Generate one clean background per prompt.

## Shared suffix

Append this to every prompt:

> First-person eye-level POV, 24mm to 35mm wide-angle lens, photorealistic Unreal Engine 5 architectural visualization, warm natural lighting, vivid but believable colors, rich surface textures, no people, no NPCs, no humans, no animals unless explicitly requested, no text labels or watermarks, no floating icons, no UI, no collage, leave a clear foreground area for future NPC placement, 16:10 landscape composition, the listed objects must be clearly visible and separated enough to become clickable vocabulary hotspots.

## Missing local scene images

### Town Square

> COSY Town central square with a stone clock tower, cobblestone paving, a public fountain, a bakery facade, a cafe facade, a park bench, street lamps, flower beds, signposts, and clear entrances to the surrounding buildings. The clock, fountain, bench, bakery sign, cafe sign, flowers, and cobblestones must be visually distinct.

### Clothing Store

> Modern boutique clothing store interior with clothing racks displaying a cotton shirt, a T-shirt, a summer dress, a warm jacket, folded clothes, full-length fitting mirrors, a checkout counter, a shopping bag, hangers, and polished hardwood flooring. Leave the central aisle unobstructed.

### Flower Shop

> Bright neighborhood flower shop interior with buckets of roses, tulips, sunflowers, potted plants, a watering can, pruning scissors, a wrapping-paper counter, a vase, flower shelves, and a glass storefront. Make each flower type and tool clearly visible.

### Bus Station

> Large clean intercity bus station concourse with a departure timetable display, ticket counter, waiting benches, travel luggage, a bus platform entrance, directional signs, and a wall clock. Keep a broad empty foreground for a future NPC.

### Hostel

> Friendly budget hostel reception and common room with a reception desk, room key board, bunk-bed hallway entrance, lockers, backpacks, a world map, a sofa, a shared kitchen notice board, and a luggage shelf. Objects must be clearly separated.

### Beach

> Quiet COSY Town beach with sandy shore, blue sea, a lifeguard tower, beach umbrella, towel, sun chair, beach ball, seashells, a cooler, and a wooden signpost. No swimmers or animals; leave an open foreground path.

### Mountain Resort

> Mountain resort lobby with a reception desk, room keys, ski and hiking maps, backpacks, a fireplace, armchairs, a large window showing mountain peaks, and a wooden sign for the trail entrance. No guests or staff.

### Camping Site

> Forest camping site with a pitched tent, sleeping bag, campfire ring with no flames, folded camping chair, backpack, lantern, cooking pot, wooden picnic table, trail sign, and firewood pile. Clear safe walking space in the foreground.

### Harbor

> COSY Town harbor promenade with a wooden pier, moored sailboats, ropes, life rings, a lighthouse in the distance, cargo crates, a harbor clock, benches, a map sign, and calm water. No people or vehicles in motion.

### Dentist

> Clean modern dentist examination room with an examination chair, dental lamp, small instrument tray, mirror, toothbrush model, cup, sink, medical chart, and cabinet. No people; keep every tool large enough to recognize.

### Camping Area

> Natural campsite clearing with a tent, picnic blanket, camp stove, metal mug, sleeping bag, lantern, backpack, firewood, trail map, and a wooden bench surrounded by trees. No people or animals.

### Stable

> Empty clean horse stable interior with wooden stalls, hay bales, a saddle, bridle, water bucket, pitchfork, feed bucket, grooming brush, and stable sign. No horses or humans; keep the aisle open.

### Vegetable Garden

> Community vegetable garden with raised beds containing carrots, tomatoes, lettuce, pumpkins, a watering can, hand trowel, gardening gloves, compost bin, seed packets, and a wooden garden sign. Morning light, distinct plants and tools.

### Flower Garden

> Public flower garden with clearly separated rose bed, tulip bed, sunflower bed, watering can, garden shears, stone path, park bench, plant labels without readable text, and a decorative fountain. No people or animals.

### Greenhouse

> Glass greenhouse interior with tomato vines, potted herbs, seed trays, watering can, gardening gloves, spray bottle, potting bench, terracotta pots, thermometer, and shelves of seedlings. Bright diffused daylight and a clear center aisle.

### Hiking Trail

> Forest hiking trailhead with a dirt path, wooden direction sign, trail map board, hiking boots, backpack, walking stick, water bottle, bench, wildflowers, and tall trees. No hikers or animals; preserve a clear trail in the foreground.

### Waterfall

> Peaceful nature viewpoint facing a waterfall with a wooden railing, rocky stream, mist, forest trees, a viewing bench, trail sign, binoculars on the bench, wildflowers, and stepping stones. No people or animals.

### Art Gallery

> Quiet contemporary art gallery with framed paintings, sculpture on a pedestal, information desk, ticket counter, gallery bench, brochure stand, directional sign, and polished floor. No visitors; leave space near the desk for a future NPC.

### Bridge

> COSY Town pedestrian bridge over a calm river with stone railings, hanging lamps, a direction sign, a bench, flower planters, river water, and distant town buildings. No pedestrians or vehicles.

### River Walk

> Riverside promenade with a paved path, river railing, wooden bench, bicycle rack, street lamp, map board, flower planters, and calm river water with trees beyond. No people or bicycles in motion.

### Public Square

> Open civic public square with a stone monument, fountain, benches, flower beds, paved plaza, street clock, information board, and surrounding civic building facades. No people; keep the central approach open.

### Science Classroom

> Modern science classroom with student desks, safety goggles, microscope, test tubes, beakers, periodic table poster with no readable text, teacher desk, blackboard, sink, and storage cabinets. No students or teacher.

### Music Room

> School music room with upright piano, acoustic guitar, violin in a stand, music stands, sheet music, drum kit, headphones, storage shelves, and soundproof wall panels. No people; separate each instrument clearly.

### Gymnasium

> Empty school gymnasium with polished court floor, basketball hoop, football, volleyball net, climbing ropes, exercise mats, sports benches, scoreboard without readable text, and equipment storage. No athletes.

### Teacher Office

> Warm teacher office with a desk, laptop, stack of textbooks, bookshelf, desk lamp, filing cabinet, wall calendar without readable text, coffee mug, plant, and two visitor chairs. No teacher; reserve one side for a future NPC.

### Playground

> Empty safe playground with swings, slide, climbing frame, sandbox, football, bench, water bottle, flower bed, and paved entrance path. No children, adults, or animals.

### Community Center

> Welcoming community center interior with information desk, notice board without readable text, stackable chairs, round activity table, bookshelf, coat rack, community map, potted plant, and accessible entrance. No people; leave a clear conversation area.

## Hotspot and NPC handoff

The game should place transparent hitboxes over the visible object rectangles, not draw replacement icons over the image. Keep object centers and boundaries visually unambiguous. When NPC assets are added later, place characters in the reserved foreground or conversation areas and do not regenerate the scene background with people.
